import { render } from "@react-email/components";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

type Options = {
  to: string;
  subject: string;
  html: React.JSX.Element;
};

export async function sendMail({
  html,
  subject,
  to,
}: Options): Promise<
  { status: "success" } | { status: "error"; message: string }
> {
  const emailHtml = await render(html);
  try {
    console.log("Sending mail to: " + to);
    await sendgrid.send({
      to,
      subject,
      from: "pils.admin@gataersamla.no",
      html: emailHtml,
    });
    console.log("Success");
    return { status: "success" };
  } catch (error: unknown) {
    console.error("Error", error);
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Ukjent feil ved sending av e-post" };
  }
}
