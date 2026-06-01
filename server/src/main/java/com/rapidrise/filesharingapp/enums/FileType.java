package com.rapidrise.filesharingapp.enums;

public enum FileType {
    IMAGE,
    VIDEO,
    AUDIO,
    DOCUMENT,
    ARCHIVE,
    OTHER;


        public static com.rapidrise.filesharingapp.enums.FileType fromMimeType(
                String mimeType
        ) {

            if (mimeType == null) {
                return OTHER;
            }

            if (mimeType.startsWith("image/")) {
                return IMAGE;
            }

            if (
                    mimeType.startsWith(
                            "video/"
                    )
                            ||
                            mimeType.contains(
                                    "matroska"
                            )
            ) {
                return VIDEO;
            }

            if (mimeType.startsWith("audio/")) {
                return AUDIO;
            }

            if (
                    mimeType.contains("pdf")
                            || mimeType.contains("word")
                            || mimeType.contains("sheet")
                            || mimeType.contains("text")
            ) {

                return DOCUMENT;
            }

            if (
                    mimeType.contains("zip")
                            || mimeType.contains("rar")
            ) {

                return ARCHIVE;
            }

            return OTHER;
        }
    }




