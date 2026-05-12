package com.rapidrise.filesharingapp.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FilePreviewService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.preview.width:400}")
    private int previewWidth;

    @Value("${file.preview.height:300}")
    private int previewHeight;

    public String generatePreview(
            String filePath,
            String storedFileName,
            String mimeType
    ) {

        try {

            Path sourcePath = Paths.get(filePath)
                    .toAbsolutePath()
                    .normalize();

            validatePreviewPath(sourcePath);

            if (!Files.exists(sourcePath)) {

                log.warn(
                        "Preview source file does not exist: {}",
                        sourcePath
                );

                return null;
            }

            BufferedImage previewImage = null;

            if (mimeType.startsWith("image/")) {

                previewImage = ImageIO.read(
                        sourcePath.toFile()
                );
            }

            else if ("application/pdf".equals(mimeType)) {

                try (
                        PDDocument document =
                                Loader.loadPDF(
                                        sourcePath.toFile()
                                )
                ) {

                    PDFRenderer renderer =
                            new PDFRenderer(document);

                    previewImage =
                            renderer.renderImageWithDPI(
                                    0,
                                    72
                            );
                }
            }

            if (previewImage == null) {

                log.warn(
                        "Preview generation unsupported for mimeType={}",
                        mimeType
                );

                return null;
            }

            return saveThumbnail(previewImage);

        } catch (Exception e) {

            log.error(
                    "Failed to generate preview for file={}",
                    storedFileName,
                    e
            );

            return null;
        }
    }

    private String saveThumbnail(
            BufferedImage image
    ) throws IOException {

        int originalWidth = image.getWidth();

        int originalHeight = image.getHeight();

        double ratio = Math.min(
                (double) previewWidth / originalWidth,
                (double) previewHeight / originalHeight
        );

        int resizedWidth =
                (int) (originalWidth * ratio);

        int resizedHeight =
                (int) (originalHeight * ratio);

        BufferedImage thumbnail =
                new BufferedImage(
                        resizedWidth,
                        resizedHeight,
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                thumbnail.createGraphics();

        graphics.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR
        );

        graphics.drawImage(
                image,
                0,
                0,
                resizedWidth,
                resizedHeight,
                null
        );

        graphics.dispose();

        String previewFileName =
                UUID.randomUUID() + "_thumb.jpg";

        Path previewDirectory = Paths.get(
                uploadDir,
                "previews"
        );

        Files.createDirectories(previewDirectory);

        Path previewPath =
                previewDirectory.resolve(previewFileName);

        ImageIO.write(
                thumbnail,
                "jpg",
                previewPath.toFile()
        );

        return "previews/" + previewFileName;
    }

    private void validatePreviewPath(
            Path path
    ) {

        Path uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        if (!path.startsWith(uploadPath)) {

            throw new SecurityException(
                    "Invalid preview path detected"
            );
        }
    }
}
