import { render } from "@react-email/components";

import type { ReactElement } from "react";

type Options = {
  to: string;
  subject: string;
  html: React.JSX.Element;
};

const from = {
  email: "pils.admin@gataersamla.no",
  name: "Pils admin",
};

export async function sendMail({
  html,
  subject,
  to,
}: Options): Promise<
  { status: "success" } | { status: "error"; message: string }
> {
  const emailHtml = await renderReactEmail(html);
  const url = "https://api.sendgrid.com/v3/mail/send";

  const emailData = {
    personalizations: [
      {
        to: [{ email: to }],
        subject,
      },
    ],
    from,
    content: [
      {
        type: "text/html",
        value: emailHtml.html,
      },
      {
        type: "text/plain",
        value: emailHtml.text,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY!}`,
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      console.log("Email sent successfully!");
      return { status: "success" };
    } else {
      const errorData = await response.json();
      console.error("Error sending email:", errorData);
      return { status: "error", message: errorData };
    }
  } catch (error) {
    console.error("Error", error);
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Ukjent feil ved sending av e-post" };
  }
}

async function renderReactEmail(react: ReactElement) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);
  return { html, text };
}
