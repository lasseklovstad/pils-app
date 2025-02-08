import { Link } from "react-router";

import { Main } from "~/components/Main";

import { FermentationDemoChart } from "./docs/fermentation-demo-chart";

export default function HomePage() {
  return (
    <Main>
      <div className="prose py-8">
        <h2 className="mt-0">Velkommen til din digitale bryggjournal! 🍺</h2>
        <p>
          Loggfør hver eneste detalj av bryggeeventyret ditt – fra malt og humle
          til gjær og temperaturer – så du aldri glemmer en oppskrift igjen.
        </p>
        <div>
          <strong>📷 Last opp bilder og videoer </strong>av bryggeprosessen for
          å forevige de magiske øyeblikkene.
        </div>
        <div>
          <strong>🎉 Del gleden!</strong> Hvert brygg får en unik QR-kode som
          lar deg enkelt dele oppskriften din med familie og venner – rett fra
          flasken eller fatet.
        </div>
        <p>
          Gjør bryggingen smartere, mer minneverdig og morsommere. Kom i gang i
          dag og ta ølbryggingen til neste nivå!
        </p>
        <Link to="/sign-up">Opprett bruker for å komme i gang her</Link>
        <h2>Bygg din egen temperaturkontroller 🌡️</h2>
        <FermentationDemoChart />
        <p>
          Lag din egen temperatur-kontroller basert på{" "}
          <a href="https://www.arduino.cc">Arduino</a> rammeverket. Koble
          kontrolleren opp mot nettsiden.
        </p>
        <strong>Hva kan du gjøre?</strong>
        <ul>
          <li>
            🌡️ Automatisk kontroll: Styr temperaturen i kjøleskap eller ovn.
          </li>
          <li>
            📈 Visualisering: Følg temperaturendringene i sanntid med grafer.
          </li>
          <li>
            🍺 Perfekt gjæring: Juster og optimaliser temperaturen for å brygge
            den beste pilsen.
          </li>
        </ul>
        <p>
          👉 <Link to="/docs">Kom i gang her</Link> og ta bryggingen din til et
          nytt nivå!
        </p>

        <img
          src="/finished-demo.jpg"
          alt="Ferdig mikrokontroller"
          className="aspect-square size-[400px] rounded object-cover shadow"
        />
      </div>
    </Main>
  );
}
