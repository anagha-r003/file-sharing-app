
export default function PageFooter({
  brandName = "VaultLink",
  brandHref = "#",
  reportHref = "#",
}) {
  return (
    <footer
      className="relative z-10 text-center py-5 mono text-xs"
      style={{
        color: "#7b7a99",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      Powered by{" "}
      <a
        href={brandHref}
        className="hover:underline"
        style={{ color: "#c084fc" }}
      >
        {brandName}
      </a>{" "}
      · Secure file sharing ·{" "}
      <a
        href={reportHref}
        className="hover:underline"
        style={{ color: "#c084fc" }}
      >
        Report abuse
      </a>
    </footer>
  );
}
