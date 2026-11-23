"use client";

import { useState, type FormEvent } from "react";
import * as tus from "tus-js-client";
import type { Course } from "../lib/api";

interface UploadSession {
  video: { id: string };
  upload: {
    endpoint: string;
    videoId: string;
    libraryId: string;
    expirationTime: number;
    signature: string;
    metadata: { title: string };
  };
}

export default function VideoUploadForm({
  courses,
  onComplete,
}: {
  courses: Course[];
  onComplete?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage("");
    setProgress(0);
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;
    setUploading(true);
    try {
      const courseId = String(form.get("courseId"));
      const response = await fetch(
        `/api/backend/admin/courses/${courseId}/videos/upload-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: String(form.get("title")),
            description: String(form.get("description") ?? ""),
            position: Number(form.get("position")),
            isFree: form.get("isFree") === "on",
          }),
        },
      );
      const body = (await response.json()) as {
        data?: UploadSession;
        error?: { message?: string };
      };
      if (!response.ok || !body.data)
        throw new Error(body.error?.message ?? "تعذر إنشاء جلسة الرفع.");
      const session = body.data;
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: session.upload.endpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
          headers: {
            AuthorizationSignature: session.upload.signature,
            AuthorizationExpire: String(session.upload.expirationTime),
            VideoId: session.upload.videoId,
            LibraryId: session.upload.libraryId,
          },
          metadata: {
            filetype: file.type || "video/mp4",
            title: session.upload.metadata.title,
          },
          onProgress: (uploaded, total) =>
            setProgress(Math.round((uploaded / total) * 100)),
          onError: reject,
          onSuccess: () => resolve(),
        });
        upload.start();
      });
      const syncResponse = await fetch(
        `/api/backend/admin/videos/${session.video.id}/sync`,
        { method: "POST" },
      );
      const syncBody = (await syncResponse.json().catch(() => null)) as {
        data?: { streamStatus?: string };
      } | null;
      if (!syncResponse.ok)
        throw new Error("تم رفع الملف، لكن تعذرت مزامنة حالته من Bunny.");
      const isReady = syncBody?.data?.streamStatus === "ready";
      setMessage(
        isReady
          ? "اكتمل رفع الفيديو ومعالجته وهو جاهز للعرض."
          : "اكتمل الرفع، وBunny يعالج الفيديو الآن. ستتحدث حالته تلقائيًا خلال دقيقتين.",
      );
      formElement.reset();
      onComplete?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر رفع الفيديو.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="m-6 grid gap-4 rounded-xl border border-[#e5ece7] bg-[#f9fcfa] p-5 sm:grid-cols-2"
    >
      <h3 className="sm:col-span-2 font-bold">رفع فيديو إلى Bunny Stream</h3>
      <select
        name="courseId"
        required
        className="rounded-xl border p-3 text-sm"
      >
        <option value="">اختر الدورة</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      <input
        name="title"
        required
        minLength={2}
        placeholder="عنوان الدرس"
        className="rounded-xl border p-3 text-sm"
      />
      <input
        name="position"
        type="number"
        min={1}
        required
        placeholder="ترتيب الدرس"
        className="rounded-xl border p-3 text-sm"
      />
      <input
        name="file"
        type="file"
        accept="video/*"
        required
        className="rounded-xl border bg-white p-3 text-sm"
      />
      <textarea
        name="description"
        placeholder="وصف مختصر"
        className="rounded-xl border p-3 text-sm sm:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input name="isFree" type="checkbox" /> فيديو مجاني
      </label>
      <button
        type="submit"
        disabled={uploading || !courses.length}
        className="rounded-xl bg-[#06cc8f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {uploading ? `جارٍ الرفع ${progress}%` : "ابدأ الرفع"}
      </button>
      {message && (
        <p role="status" className="text-sm sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
