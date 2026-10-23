import io
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.config import Settings, get_settings
from app.schemas.analysis import IssueAnalysisResponse, StructuredAnalysis
from app.services.gemini_service import (
    GeminiService,
    GeminiNotConfiguredError,
    GeminiQuotaError,
    GeminiTimeoutError,
    GeminiPermissionError,
    GeminiProviderError,
)

router = APIRouter(prefix="/api/v1", tags=["Analysis"])
logger = logging.getLogger("civicsignal-api.routes.analysis")

ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}


def get_gemini_service(settings: Settings = Depends(get_settings)) -> GeminiService:
    return GeminiService(settings=settings)


@router.post(
    "/analyze-issue",
    response_model=IssueAnalysisResponse,
    summary="Analyze civic issue with Google Gemini",
    description="Submits a citizen issue description and/or image to Google Gemini for structured triage and validation."
)
async def analyze_civic_issue(
    description: Optional[str] = Form(None),
    category_hint: Optional[str] = Form(None),
    location_label: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    settings: Settings = Depends(get_settings),
    service: GeminiService = Depends(get_gemini_service),
) -> IssueAnalysisResponse:
    request_id = str(uuid.uuid4())

    # Validation: Description or image must be provided
    has_description = bool(description and description.strip())
    has_image = bool(image and image.filename)

    if not has_description and not has_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least an issue description or an image must be provided for analysis.",
        )

    if description and len(description) > 4000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description length exceeds maximum permitted limit of 4000 characters.",
        )

    # Process and validate image if present
    image_bytes: Optional[bytes] = None
    image_mime: Optional[str] = None

    if has_image and image:
        # Check declared MIME type
        content_type = image.content_type.lower() if image.content_type else ""
        if content_type not in ALLOWED_IMAGE_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Allowed formats: JPEG, PNG, WEBP.",
            )

        # Read content and enforce size boundary
        try:
            image_bytes = await image.read()
            if len(image_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    detail=f"Image file exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB.",
                )

            # Deep inspection: Verify real image content with Pillow (do not trust extension or header alone)
            try:
                with Image.open(io.BytesIO(image_bytes)) as pil_img:
                    pil_img.verify()
                    image_mime = content_type
            except (UnidentifiedImageError, Exception) as img_err:
                logger.warning(f"Failed image payload verification: {img_err}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Corrupted or invalid image data. The file contents do not match a valid image.",
                )

        finally:
            await image.close()

    # Execute Gemini Analysis
    try:
        analysis: StructuredAnalysis = service.analyze_issue(
            description=description,
            image_bytes=image_bytes,
            image_mime_type=image_mime,
            category_hint=category_hint,
            location_label=location_label,
        )

        return IssueAnalysisResponse(
            request_id=request_id,
            status="completed",
            analysis=analysis,
            model=settings.GEMINI_MODEL,
            message="Real AI analysis completed successfully by Gemini.",
        )

    except GeminiNotConfiguredError as e:
        logger.warning(f"[{request_id}] Gemini requested but unconfigured: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "request_id": request_id,
                "status": "unconfigured",
                "message": str(e),
            },
        )
    except GeminiQuotaError as e:
        logger.error(f"[{request_id}] Gemini rate limit or quota exhausted: {e}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "request_id": request_id,
                "status": "error",
                "message": str(e),
            },
        )
    except GeminiPermissionError as e:
        logger.error(f"[{request_id}] Gemini permission blocked: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "request_id": request_id,
                "status": "error",
                "message": str(e),
            },
        )
    except GeminiTimeoutError as e:
        logger.error(f"[{request_id}] Gemini request timeout: {e}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "request_id": request_id,
                "status": "error",
                "message": str(e),
            },
        )
    except GeminiProviderError as e:
        logger.error(f"[{request_id}] Gemini provider error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "request_id": request_id,
                "status": "error",
                "message": str(e),
            },
        )
    except Exception as e:
        logger.exception(f"[{request_id}] Unexpected error in analyze_civic_issue: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "request_id": request_id,
                "status": "error",
                "message": "An internal error occurred while processing the AI analysis.",
            },
        )
