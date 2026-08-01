export const metadata = {
  title: 'Privacy - nthtime',
  description:
    'What nthtime collects, the cookies it sets, how errors are monitored, and how to request deletion of your data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-9 py-12">
      <div className="prose prose-sm dark:prose-invert max-w-2xl text-muted-foreground">
        <h1 className="text-foreground">Privacy</h1>
        <p className="text-xs uppercase tracking-wider">Last updated 1 August 2026</p>

        <p>
          nthtime is a practice tool for drilling code patterns. This page describes, in plain
          language, what the site collects and why. It is a good-faith summary of how the app
          actually works, not formal legal advice.
        </p>

        <h2 className="text-foreground">Using nthtime without an account</h2>
        <p>
          You can browse the catalog, open challenges, and run the in-browser verification engine
          without signing in. Verification runs entirely in your browser; your solution code is not
          sent to our servers to be checked. Anonymous use does not create any account record.
        </p>

        <h2 className="text-foreground">What we collect when you sign in</h2>
        <p>
          Signing in is optional and uses GitHub OAuth. When you choose to sign in, we store:
        </p>
        <ul>
          <li>
            <strong>GitHub identity</strong> - your GitHub name, avatar, and the email address
            GitHub exposes to the app, used to create and identify your account.
          </li>
          <li>
            <strong>Practice activity</strong> - your challenge attempts, progress, and streaks, so
            the app can track what you have completed.
          </li>
          <li>
            <strong>Settings</strong> - the preferences you configure (such as editor and display
            options).
          </li>
          <li>
            <strong>Packs you author</strong> - if you use the author tools, the packs and
            challenges you create.
          </li>
        </ul>

        <h2 className="text-foreground">Cookies</h2>
        <p>nthtime sets only functional cookies - no advertising or cross-site tracking cookies:</p>
        <ul>
          <li>
            <code>JSESSIONID</code> - keeps you signed in for the duration of your session.
          </li>
          <li>
            <code>XSRF-TOKEN</code> - protects form and API requests against cross-site request
            forgery.
          </li>
        </ul>

        <h2 className="text-foreground">Error and performance monitoring</h2>
        <p>
          We use Sentry to capture client-side and backend errors and basic performance data so we
          can find and fix bugs. This may include technical details about the request and, for
          signed-in users, an identifier associating the event with your account.
        </p>
        <p>
          Sentry Session Replay is enabled: it records a replay of roughly 10% of sessions, plus any
          session in which an error occurs, to help us reproduce problems. By default these replays
          mask on-screen text and form input and block media, so the content you type is obscured in
          the recording.
        </p>

        <h2 className="text-foreground">Data retention and deletion</h2>
        <p>
          We keep your account data for as long as your account exists. You can delete your account
          at any time from your account settings. Deleting your account removes your profile, your
          linked GitHub sign-in, and your attempts, progress, and settings.
        </p>
        <p>
          Any packs or tracks you published stay publicly visible after deletion, but they are no
          longer linked to your account and can no longer be edited. Revoking the nthtime OAuth
          authorization in your GitHub settings stops any further access to your GitHub data.
        </p>

        <h2 className="text-foreground">Contact</h2>
        <p>
          For any privacy question, reach us through the project on{' '}
          <a
            href="https://github.com/spencerjireh/nthtime"
            target="_blank"
            rel="noreferrer"
            className="text-primary"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
