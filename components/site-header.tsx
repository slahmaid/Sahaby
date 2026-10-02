import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="button type1" href="/#order" aria-label="ابدأ القراءة" />
      <Image
        className="logo"
        src="/Logo.svg"
        alt="شعار صحابي"
        width={2048}
        height={933}
        priority
      />
    </header>
  );
}
