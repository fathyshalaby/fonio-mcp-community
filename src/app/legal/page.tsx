import type { Metadata } from "next";
import { AFFILIATION_DISCLAIMER, LIABILITY_DISCLAIMER } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "License & disclaimer" };

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Community project</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        License and disclaimer
      </h1>
      <p className="mt-4 text-muted-foreground">{AFFILIATION_DISCLAIMER}</p>
      <p className="mt-4 text-muted-foreground">{LIABILITY_DISCLAIMER}</p>
      <p className="mt-4 text-muted-foreground">
        fonio, fonio.ai, and related marks belong to their owners. Use of those
        names here is only to describe compatibility with the public API.
      </p>
      <p className="mt-4 text-muted-foreground">
        Full license text:{" "}
        <a href={`${SITE.github}/blob/main/LICENSE`} className="text-primary hover:underline">
          MIT LICENSE
        </a>{" "}
        in this repository.
      </p>
    </div>
  );
}
