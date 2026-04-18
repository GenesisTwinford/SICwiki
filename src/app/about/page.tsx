import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | SICwiki",
};

const sections = [
  {
    heading: "SICについて",
    headingLevel: "h1",
    lines: [
      "沖縄にある名桜大学のIT系サークルです。テクノロジーを活用した地方創生に取り組んでいます。",
    ],
  },
  {
    heading: "これまでの活動実績",
    headingLevel: "h2",
    lines: ["小中学校への出前授業、離島でのスマホ相談会など。", "", "↓詳細はこちら", "令和7年度："],
  },
] as const;

const sectionHeadingClass =
  "border-l-8 border-sky-300 pl-4 text-[28px] font-bold leading-[1.2] md:text-[36px]";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="mx-auto flex h-[88px] w-full max-w-[1280px] items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" aria-label="SICwiki home">
          <Image
            src="/sic-about-logo.png"
            alt="SIC"
            width={93}
            height={93}
            priority
            className="h-[93px] w-[93px] shrink-0 object-cover"
          />
        </Link>
        <div className="hidden min-w-0 flex-1 md:block" aria-hidden="true" />
        <div className="h-7 w-7 shrink-0 md:hidden" aria-hidden="true" />
        <nav aria-label="SICwiki">
          <Link
            href="/"
            className="inline-flex h-[47px] w-[168px] items-center justify-center rounded-[12px] bg-black px-4 py-3 text-center text-base font-medium leading-[1.45] tracking-[-0.08px] !text-white transition hover:bg-neutral-800"
          >
            SICwikiはこちら！（開発中）
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto h-[240px] w-full max-w-[1280px] overflow-hidden md:h-[560px]">
        <Image
          src="/sic-about-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <p className="[font-family:var(--font-share-tech-mono)] text-[64px] leading-none md:text-[120px]">
            SIC
          </p>
          <p className="[font-family:var(--font-zen-dots)] text-base leading-none md:text-[32px]">
            Social Innovation Club
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1280px] justify-center px-2 py-8 md:px-60 md:py-20">
        <div className="flex w-full max-w-[800px] flex-col gap-12">
          {sections.map((section) => {
            const Heading = section.headingLevel;

            return (
              <section key={section.heading} className="flex flex-col gap-4">
                <Heading className={sectionHeadingClass}>
                  {section.heading}
                </Heading>
                <p className="text-lg font-medium leading-[1.45] tracking-[-0.09px] text-black/85">
                  {section.lines.map((line, index) => (
                    <span key={`${section.heading}-${index}`}>
                      {line}
                      {index < section.lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </section>
            );
          })}

          <section className="flex flex-col gap-4">
            <h2 className={sectionHeadingClass}>
              お問い合わせ
            </h2>
            <a
              href="https://www.instagram.com/meio_sic_new/"
              target="_blank"
              rel="noreferrer"
              className="link-text text-lg font-medium leading-[1.45] tracking-[-0.09px]"
            >
              Instagram
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}
