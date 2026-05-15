/**
 * Elegant HTML email templates designed following a Linear-inspired design language.
 * Featuring amber accents, refined spacing, and dark zinc accents.
 */

interface EmailTemplateParams {
    userName: string;
    todayString: string;
    trialDaysLeft?: number;
    isPaid: boolean;
    insightsHtml: string; // Raw HTML for formatting bullet points / bold elements from Kea
    propertySummaries: Array<{
        propertyName: string;
        sessions: number;
        users: number;
        bounceRate: number;
    }>;
    baseUrl: string;
}

export function buildDailySummaryEmail({
    userName,
    todayString,
    trialDaysLeft,
    isPaid,
    insightsHtml,
    propertySummaries,
    baseUrl,
}: EmailTemplateParams): string {
    const settingsUrl = `${baseUrl}/dashboard/settings`;
    const isTrial = !isPaid && typeof trialDaysLeft === 'number' && trialDaysLeft >= 0;

    // Generate table rows for properties
    const propertyRows = propertySummaries.length > 0 
        ? propertySummaries.map(p => `
            <tr style="border-bottom: 1px solid #f4f4f5;">
                <td style="padding: 12px 8px; font-size: 13px; color: #18181b; font-weight: 500;">${p.propertyName}</td>
                <td style="padding: 12px 8px; font-size: 13px; color: #52525b; text-align: right; font-variant-numeric: tabular-nums;">${p.sessions.toLocaleString()}</td>
                <td style="padding: 12px 8px; font-size: 13px; color: #52525b; text-align: right; font-variant-numeric: tabular-nums;">${p.users.toLocaleString()}</td>
                <td style="padding: 12px 8px; font-size: 13px; color: #52525b; text-align: right; font-variant-numeric: tabular-nums;">${(p.bounceRate * 100).toFixed(1)}%</td>
            </tr>
        `).join('')
        : `<tr><td colspan="4" style="padding: 16px; font-size: 12px; color: #71717a; text-align: center;">No analytics data available for yesterday</td></tr>`;

    const trialBanner = isTrial
        ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="font-size: 12px; font-weight: 500; color: #d97706;">
                        ⏳ Your trial period ends in ${trialDaysLeft} ${trialDaysLeft === 1 ? 'day' : 'days'}.
                    </td>
                    <td style="text-align: right;">
                        <a href="${baseUrl}/dashboard/settings" style="font-size: 12px; font-weight: 600; color: #b45309; text-decoration: none;">Upgrade Plan &rarr;</a>
                    </td>
                </tr>
            </table>
        </div>
        `
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        @media only screen and (max-width: 600px) {
            .content-card { padding: 20px !important; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .prose-content p { margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #3f3f46; font-size: 14px; }
        .prose-content strong { color: #18181b; font-weight: 600; }
        .prose-content ul { margin-top: 0; margin-bottom: 16px; padding-left: 20px; }
        .prose-content li { margin-bottom: 6px; color: #3f3f46; font-size: 14px; }
    </style>
</head>
<body style="background-color: #fafafa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa;">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);" class="content-card">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f4f4f5;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: -0.01em; display: flex; align-items: center;">
                                            <span style="color: #f59e0b; margin-right: 6px;">✦</span> Helpful Analytics
                                        </div>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="font-size: 12px; color: #71717a; font-weight: 500; background-color: #f4f4f5; padding: 4px 10px; border-radius: 20px;">${todayString}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 32px;">
                            
                            ${trialBanner}

                            <h1 style="font-size: 20px; font-weight: 600; color: #18181b; margin-top: 0; margin-bottom: 8px; letter-spacing: -0.02em;">
                                Good evening, ${userName.split(' ')[0]} 👋
                            </h1>
                            <p style="font-size: 14px; color: #71717a; margin-top: 0; margin-bottom: 24px;">
                                Here's your automated summary compiled from your GA4 properties.
                            </p>

                            <!-- Kea personality insights section -->
                            <div style="background-color: #fcfaf6; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 32px; position: relative;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #d97706; margin-bottom: 12px; display: flex; align-items: center;">
                                    <img src="https://helpfulanalytics.com/kea.svg" alt="Kea" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 6px; vertical-align: middle;" onerror="this.style.display='none'" />
                                    Kea's Analysis
                                </div>
                                <div class="prose-content" style="font-size: 14px; color: #3f3f46;">
                                    ${insightsHtml}
                                </div>
                            </div>

                            <!-- Performance Table Title -->
                            <h3 style="font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 12px;">
                                Connected Property Statistics (Yesterday)
                            </h3>

                            <!-- Custom table component -->
                            <div style="border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
                                            <th align="left" style="padding: 10px 8px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.03em;">Property</th>
                                            <th align="right" style="padding: 10px 8px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.03em;">Sessions</th>
                                            <th align="right" style="padding: 10px 8px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.03em;">Users</th>
                                            <th align="right" style="padding: 10px 8px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.03em;">Bounce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${propertyRows}
                                    </tbody>
                                </table>
                            </div>

                            <div style="text-align: center; margin-top: 32px; margin-bottom: 8px;">
                                <a href="${baseUrl}/dashboard" style="background-color: #18181b; color: #ffffff; font-size: 13px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 8px; display: inline-block; border: 1px solid #27272a; transition: background-color 0.2s;">
                                    View Full Dashboard
                                </a>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px 32px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
                            <p style="font-size: 12px; color: #a1a1aa; margin-top: 0; margin-bottom: 8px;">
                                Sent to you because you opted into automated AI reporting.
                            </p>
                            <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                                Adjust frequency or turn off at <a href="${settingsUrl}" style="color: #71717a; text-decoration: underline;">Notification Settings</a>.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
