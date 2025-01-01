import * as E from "@react-email/components";

export function SignupEmail({
  onboardingUrl,
  otp,
}: {
  onboardingUrl: string;
  otp: string;
}) {
  return (
    <E.Html lang="nb" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Velkommen til Pils!</E.Text>
        </h1>
        <p>
          <E.Text>
            Her er koden: <strong>{otp}</strong>
          </E.Text>
        </p>
        <p>
          <E.Text>Eller trykk på lenken for å komme i gang:</E.Text>
        </p>
        <E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
      </E.Container>
    </E.Html>
  );
}
