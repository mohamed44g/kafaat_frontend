export const categories = [
  "التكييف والتبريد",
  "الأنظمة الكهربائية",
  "السباكة",
  "المنزل الذكي",
  "النجارة",
  "الصيانة العامة",
];
export const courses = [
  {
    slug: "ac-basics",
    title: "أساسيات التكييف والتبريد",
    category: "التكييف والتبريد",
    duration: "15 ساعة و 5 دقائق",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "electrical-basics",
    title: "التمديدات الكهربائية للمبتدئين",
    category: "الأنظمة الكهربائية",
    duration: "8 ساعات و 30 دقيقة",
    image:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "plumbing-basics",
    title: "أساسيات السباكة والصيانة",
    category: "السباكة",
    duration: "6 ساعات و 15 دقيقة",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "smart-home",
    title: "مدخل إلى أنظمة المنزل الذكي",
    category: "المنزل الذكي",
    duration: "4 ساعات و 20 دقيقة",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "carpentry",
    title: "تعلم النجارة خطوة بخطوة",
    category: "النجارة",
    duration: "10 ساعات و 10 دقائق",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "maintenance",
    title: "مهارات الصيانة العملية",
    category: "الصيانة العامة",
    duration: "7 ساعات و 45 دقيقة",
    image:
      "https://images.unsplash.com/photo-1581147036324-c1c7624e0e7e?auto=format&fit=crop&w=900&q=80",
  },
];

export function getCourseLessons(category: string) {
  return [
    "مقدمة إلى الدورة",
    `التعرف على أساسيات ${category}`,
    "الأدوات واشتراطات السلامة",
    "تطبيق عملي وخطوات العمل",
  ];
}
