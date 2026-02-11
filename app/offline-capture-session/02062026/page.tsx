import fs from "fs";
import path from "path";
import { Heading } from "@/components/heading";
import { Button } from "@/components/button";

function fetchImages(isAll = true) {
  let imagesDir = path.join(process.cwd(), "public/session_02062026/all");
  if (!isAll) {
    imagesDir = path.join(process.cwd(), "public/session_02062026/good");
  }

  let files: string[] = [];

  try {
    files = fs
      .readdirSync(imagesDir)
      .filter((file) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
  } catch (err) {
    console.error("Error reading images:", err);
  }

  return files;
}

export default async function CaptureSessionPage() {
  const files = fetchImages();
  const selected = fetchImages(false);

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-950/10 dark:border-white/10">
        <Heading>Offline Capture Session 02/06/2026</Heading>
      </div>

      <div className="">
        <h2 style={{fontSize: "25px", marginTop: "40px"}}>Approved Captures</h2>
      </div>
      {/* Gallery */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {selected.map((file) => {
          const src = `/session_02062026/all/${file}`;

          return (
            <a
              key={file}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <div className="w-full aspect-square overflow-hidden rounded-lg border bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={src}
                  alt={file}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </a>
          );
        })}
      </div>
      <div className="">
        <h2 style={{fontSize: "25px", marginTop: "40px"}}>All Session Images</h2>
      </div>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => {
          const src = `/session_02062026/all/${file}`;

          return (
            <a
              key={file}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <div className="w-full aspect-square overflow-hidden rounded-lg border bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={src}
                  alt={file}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
