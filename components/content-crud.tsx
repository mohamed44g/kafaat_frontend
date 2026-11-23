"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { Category, Course, Instructor, VideoLesson } from "../lib/api";
import VideoUploadForm from "./video-upload-form";

type Resource = "categories" | "instructors" | "courses" | "videos";
type Entity = Category | Instructor | Course | VideoLesson;

interface Props {
  resource: Resource;
  categories: Category[];
  instructors: Instructor[];
  courses: Course[];
}

const labels: Record<Resource, string> = {
  categories: "قسم",
  instructors: "مدرب",
  courses: "دورة",
  videos: "درس",
};

async function request(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const response = await fetch(`/api/backend/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  if (!response.ok) throw new Error(payload?.error?.message ?? "تعذرت العملية. حاول مرة أخرى.");
}

export default function ContentCrud({ resource, categories, instructors, courses }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Entity | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const videos = courses.flatMap((course) =>
    (course.videos ?? []).map((video) => ({ ...video, courseTitle: course.title })),
  );
  const items = resource === "categories" ? categories : resource === "instructors" ? instructors : resource === "courses" ? courses : videos;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const base = `admin/${resource}`;
    const id = editing?.id;
    const body = buildPayload(resource, form);
    setMessage("");
    startTransition(async () => {
      try {
        await request(id ? `${base}/${id}` : base, id ? "PATCH" : "POST", body);
        setEditing(null);
        event.currentTarget.reset();
        setMessage(`تم حفظ ${labels[resource]} بنجاح.`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذرت العملية.");
      }
    });
  }
  function remove(id: string) {
    if (!window.confirm(`هل تريد حذف هذا ${labels[resource]}؟`)) return;
    setMessage("");
    startTransition(async () => {
      try {
        await request(`admin/${resource}/${id}`, "DELETE");
        if (editing?.id === id) setEditing(null);
        setMessage("تم الحذف بنجاح.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذر الحذف.");
      }
    });
  }
  function syncVideo(id: string) {
    setMessage("");
    startTransition(async () => {
      try {
        await request(`admin/videos/${id}/sync`, "POST");
        setMessage("تمت مزامنة حالة الفيديو من Bunny.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذرت مزامنة الفيديو.");
      }
    });
  }

  if (resource === "videos") {
    return (
      <div>
        <VideoUploadForm courses={courses} onComplete={() => router.refresh()} />
        <ContentList resource={resource} items={items} editing={editing} setEditing={setEditing} remove={remove} syncVideo={syncVideo} pending={pending} />
        {editing && <Editor resource={resource} entity={editing} categories={categories} instructors={instructors} courses={courses} save={save} cancel={() => setEditing(null)} pending={pending} />}
        <Status message={message} />
      </div>
    );
  }
  return (
    <div className="p-6">
      <Editor resource={resource} entity={editing} categories={categories} instructors={instructors} courses={courses} save={save} cancel={() => setEditing(null)} pending={pending} />
      <Status message={message} />
      <ContentList resource={resource} items={items} editing={editing} setEditing={setEditing} remove={remove} syncVideo={syncVideo} pending={pending} />
    </div>
  );
}

function Status({ message }: { message: string }) {
  return message ? <p role="status" className="mb-4 text-sm text-[#238d68]">{message}</p> : null;
}

function Editor({ resource, entity, categories, instructors, save, cancel, pending }: Props & { entity: Entity | null; save: (event: FormEvent<HTMLFormElement>) => void; cancel: () => void; pending: boolean }) {
  const course = entity as Course | null;
  const instructor = entity as Instructor | null;
  const video = entity as VideoLesson | null;
  return (
    <form key={entity?.id ?? "new"} onSubmit={save} className="mb-6 grid gap-3 rounded-2xl border border-[#e4ede7] bg-[#f9fcfa] p-5 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-center justify-between gap-3"><h3 className="font-bold">{entity ? `تعديل ${labels[resource]}` : `إضافة ${labels[resource]} جديد`}</h3>{entity && <button type="button" onClick={cancel} className="text-sm text-[#75817a]">إلغاء</button>}</div>
      {resource === "categories" && <Field name="title" label="اسم القسم" defaultValue={(entity as Category | null)?.title} required />}
      {resource === "instructors" && <><Field name="name" label="اسم المدرب" defaultValue={instructor?.name} required /><Field name="avatarUrl" label="رابط الصورة (اختياري)" defaultValue={instructor?.avatarUrl ?? ""} type="url" /><TextArea name="bio" label="نبذة المدرب" defaultValue={instructor?.bio} required /></>}
      {resource === "courses" && <><Field name="title" label="عنوان الدورة" defaultValue={course?.title} required /><Field name="slug" label="المعرف بالرابط" defaultValue={course?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><Field name="thumbnailUrl" label="رابط الصورة (اختياري)" defaultValue={course?.thumbnailUrl ?? ""} type="url" /><Select name="categoryId" label="القسم" options={categories.map((item) => [item.id, item.title])} defaultValue={course?.categoryId} required /><Select name="instructorId" label="المدرب" options={instructors.map((item) => [item.id, item.name])} defaultValue={course?.instructorId} required /><TextArea name="description" label="وصف الدورة" defaultValue={course?.description} required /><Check name="isPublished" label="نشر الدورة للطلاب" defaultChecked={course?.isPublished ?? false} /></>}
      {resource === "videos" && <><Field name="title" label="عنوان الدرس" defaultValue={video?.title} required /><Field name="position" label="ترتيب الدرس" defaultValue={video?.position} type="number" required /><Field name="durationSeconds" label="المدة بالثواني" defaultValue={video?.durationSeconds} type="number" required /><TextArea name="description" label="وصف الدرس" defaultValue={video?.description ?? ""} /><Check name="isFree" label="درس مجاني" defaultChecked={video?.isFree ?? false} /></>}
      <button disabled={pending || (resource === "courses" && (!categories.length || !instructors.length))} className="rounded-xl bg-[#06cc8f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{pending ? "جارٍ الحفظ..." : entity ? "حفظ التعديلات" : `إضافة ${labels[resource]}`}</button>
    </form>
  );
}

function ContentList({ resource, items, setEditing, remove, syncVideo, pending }: { resource: Resource; items: Array<Entity & { courseTitle?: string }>; editing: Entity | null; setEditing: (entity: Entity) => void; remove: (id: string) => void; syncVideo: (id: string) => void; pending: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-right text-sm"><thead className="bg-[#f9fbfa] text-xs text-[#8a9690]"><tr><th className="px-4 py-3">العنصر</th><th className="px-4 py-3">التفاصيل</th><th className="px-4 py-3">الإجراءات</th></tr></thead><tbody>{items.length ? items.map((item) => <tr key={item.id} className="border-t border-[#f0f3f1]"><td className="px-4 py-4 font-semibold text-[#252b3d]">{"title" in item ? item.title : "name" in item ? item.name : "—"}</td><td className="px-4 py-4 text-[#7b8581]">{details(resource, item)}</td><td className="flex gap-3 px-4 py-4">{resource === "videos" && <button onClick={() => syncVideo(item.id)} disabled={pending} className="font-semibold text-[#875f00] disabled:opacity-50">تحديث من Bunny</button>}<button onClick={() => setEditing(item)} className="font-semibold text-[#009d70]">تعديل</button><button onClick={() => remove(item.id)} disabled={pending} className="font-semibold text-red-500 disabled:opacity-50">حذف</button></td></tr>) : <tr><td colSpan={3} className="p-8 text-center text-[#929c96]">لا توجد بيانات بعد.</td></tr>}</tbody></table></div>;
}
function details(resource: Resource, item: Entity & { courseTitle?: string }) { if (resource === "categories") return "قسم تدريبي"; if (resource === "instructors") return (item as Instructor).bio; if (resource === "courses") { const course=item as Course; return `${course.category?.title ?? ""} · ${course.instructor?.name ?? ""}`; } const video=item as VideoLesson & {courseTitle?:string}; return `${video.courseTitle ?? ""} · ${video.isFree ? "مجاني" : "للمشتركين"} · ${video.streamStatus}`; }
function Field({ label, ...props }: { label:string; name:string; defaultValue?: string|number; required?:boolean; type?:string; pattern?:string }) { return <label className="grid gap-1 text-sm font-semibold">{label}<input {...props} className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#06cc8f]" /></label>; }
function TextArea({ label, defaultValue, ...props }: { label:string; name:string; defaultValue?:string|null; required?:boolean }) { return <label className="grid gap-1 text-sm font-semibold sm:col-span-2">{label}<textarea {...props} defaultValue={defaultValue ?? ""} rows={3} className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#06cc8f]" /></label>; }
function Select({ label, options, ...props }: { label:string; options:string[][]; name:string; defaultValue?:string; required?:boolean }) { return <label className="grid gap-1 text-sm font-semibold">{label}<select {...props} className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#06cc8f]"><option value="">اختر</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>; }
function Check({ label, ...props }: { label:string; name:string; defaultChecked?:boolean }) { return <label className="flex items-center gap-2 self-end text-sm font-semibold"><input {...props} type="checkbox" />{label}</label>; }
function buildPayload(resource: Resource, form: FormData) { const text=(name:string)=>String(form.get(name) ?? "").trim(); if(resource==="categories") return {title:text("title")}; if(resource==="instructors") return {name:text("name"),bio:text("bio"),avatarUrl:text("avatarUrl") || undefined}; if(resource==="courses") return {title:text("title"),slug:text("slug"),description:text("description"),thumbnailUrl:text("thumbnailUrl") || undefined,categoryId:text("categoryId"),instructorId:text("instructorId"),isPublished:form.get("isPublished")==="on"}; return {title:text("title"),description:text("description") || undefined,position:Number(form.get("position")),durationSeconds:Number(form.get("durationSeconds")),isFree:form.get("isFree")==="on"}; }
