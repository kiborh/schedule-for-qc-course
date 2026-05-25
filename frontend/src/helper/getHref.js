import React from 'react';
import {COMMON_LINK_TO_MEETING_WORD} from '../constants/translationLabels/common';
import i18n from '../i18n';

const normalizeLink = (link) => {
    if (!link || !String(link).trim()) {
        return null;
    }

    const trimmedLink = String(link).trim();

    if (/^https?:\/\//i.test(trimmedLink)) {
        return trimmedLink;
    }

    return `https://${trimmedLink}`;
};

export const getHref = (link, attributes = {}) => {
    const normalizedLink = normalizeLink(link);

    if (!normalizedLink) {
        return null;
    }

    return (
        <a
            title={normalizedLink}
            className="link-to-meeting"
            href={normalizedLink}
            target="_blank"
            rel="noreferrer"
            {...attributes}
        >
            {i18n.t(COMMON_LINK_TO_MEETING_WORD)}
        </a>
    );
};
