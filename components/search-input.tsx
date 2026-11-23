"use client";

import { useSearchParams } from "next/navigation";

export default function SearchInput() {
  const query = useSearchParams().get("q") ?? "";
  return (
    <input
      key={query}
      id="course-search"
      name="q"
      type="search"
      defaultValue={query}
      placeholder="ابحث عن دورة..."
      className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
    />
  );
}
