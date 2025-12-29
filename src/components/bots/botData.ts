// Bot data types and predefined bots
// Easy to add new bots - just add to the appropriate category array

export interface Bot {
    id: string;
    name: string;
    nameKey: string;          // Translation key for bot name
    rating: number;
    description: string;
    descriptionKey: string;   // Translation key for description
    category: BotCategory;
    image?: string;           // Path to bot image
    country?: string | string[]; // Country code(s) for flag (e.g., "us", "ru", or ["fr", "ir"])
    greeting?: string;        // Custom greeting translation key
    cardStyle?: "golden";    // Special card appearance style
}

export type CardStyle = "golden";

export type BotCategory =
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | "Master"
    | "Champions"
    | "Musicians"
    | "TopPlayers"
    | "Engine"
    | "Custom";

export const BOT_CATEGORIES: BotCategory[] = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Master",
    "Champions",
    "Musicians",
    "TopPlayers",
    "Engine",
];

// ============================================================
// BEGINNER BOTS (400-800 Elo)
// ============================================================
export const BEGINNER_BOTS: Bot[] = [
    {
        id: "martin",
        name: "مارتین",
        nameKey: "Bots.Bot.Martin.Name",
        rating: 400,
        description: "ربات مبتدی دوستانه که تازه قوانین را یاد گرفته است.",
        descriptionKey: "Bots.Bot.Martin.Desc",
        category: "Beginner",
        image: "/bots/beginner/martin.png",
    },
    {
        id: "wayne",
        name: "وین",
        nameKey: "Bots.Bot.Wayne.Name",
        rating: 428,
        description: "ربات مبتدی که حرکت‌های ساده انجام می‌دهد.",
        descriptionKey: "Bots.Bot.Wayne.Desc",
        category: "Beginner",
        image: "/bots/beginner/wayne.png",
    },
    {
        id: "fabian",
        name: "فابیان",
        nameKey: "Bots.Bot.Fabian.Name",
        rating: 457,
        description: "ربات مبتدی با استراتژی‌های پایه.",
        descriptionKey: "Bots.Bot.Fabian.Desc",
        category: "Beginner",
        image: "/bots/beginner/fabian.png",
    },
    {
        id: "juan",
        name: "خوان",
        nameKey: "Bots.Bot.Juan.Name",
        rating: 485,
        description: "ربات مبتدی که الگوهای تاکتیکی ساده را یاد می‌گیرد.",
        descriptionKey: "Bots.Bot.Juan.Desc",
        category: "Beginner",
        image: "/bots/beginner/juan.png",
    },
    {
        id: "filip",
        name: "فیلیپ",
        nameKey: "Bots.Bot.Filip.Name",
        rating: 514,
        description: "ربات مبتدی با حرکت‌های آرام و ثابت.",
        descriptionKey: "Bots.Bot.Filip.Desc",
        category: "Beginner",
        image: "/bots/beginner/filip.png",
    },
    {
        id: "elani",
        name: "الانی",
        nameKey: "Bots.Bot.Elani.Name",
        rating: 543,
        description: "ربات مبتدی عضو باشگاه شطرنج مدرسه.",
        descriptionKey: "Bots.Bot.Elani.Desc",
        category: "Beginner",
        image: "/bots/beginner/elani.png",
    },
    {
        id: "noel",
        name: "نوئل",
        nameKey: "Bots.Bot.Noel.Name",
        rating: 571,
        description: "ربات مبتدی کنجکاو که الگوهای تاکتیکی را یاد می‌گیرد.",
        descriptionKey: "Bots.Bot.Noel.Desc",
        category: "Beginner",
        image: "/bots/beginner/noel.png",
    },
    {
        id: "oliver",
        name: "اولیور",
        nameKey: "Bots.Bot.Oliver.Name",
        rating: 600,
        description: "ربات مبتدی با دانش پایه.",
        descriptionKey: "Bots.Bot.Oliver.Desc",
        category: "Beginner",
        image: "/bots/beginner/oliver.png",
    },
    {
        id: "milica",
        name: "میلیکا",
        nameKey: "Bots.Bot.Milica.Name",
        rating: 628,
        description: "ربات مبتدی که حرکت‌های ساده دوست دارد.",
        descriptionKey: "Bots.Bot.Milica.Desc",
        category: "Beginner",
        image: "/bots/beginner/milica.png",
    },
    {
        id: "aron",
        name: "آرون",
        nameKey: "Bots.Bot.Aron.Name",
        rating: 657,
        description: "ربات مبتدی با استراتژی‌های ابتدایی.",
        descriptionKey: "Bots.Bot.Aron.Desc",
        category: "Beginner",
        image: "/bots/beginner/aron.png",
    },
    {
        id: "janjay",
        name: "جانجای",
        nameKey: "Bots.Bot.Janjay.Name",
        rating: 685,
        description: "ربات مبتدی دوستانه.",
        descriptionKey: "Bots.Bot.Janjay.Desc",
        category: "Beginner",
        image: "/bots/beginner/janjay.png",
    },
    {
        id: "mina",
        name: "مینا",
        nameKey: "Bots.Bot.Mina.Name",
        rating: 714,
        description: "ربات مبتدی که قوانین را یاد می‌گیرد.",
        descriptionKey: "Bots.Bot.Mina.Desc",
        category: "Beginner",
        image: "/bots/beginner/mina.png",
    },
    {
        id: "zara",
        name: "زارا",
        nameKey: "Bots.Bot.Zara.Name",
        rating: 743,
        description: "ربات مبتدی با حرکت‌های پایه.",
        descriptionKey: "Bots.Bot.Zara.Desc",
        category: "Beginner",
        image: "/bots/beginner/zara.png",
    },
    {
        id: "santiago",
        name: "سانتیاگو",
        nameKey: "Bots.Bot.Santiago.Name",
        rating: 771,
        description: "ربات مبتدی کنجکاو.",
        descriptionKey: "Bots.Bot.Santiago.Desc",
        category: "Beginner",
        image: "/bots/beginner/santiago.png",
    },
    {
        id: "karim",
        name: "کریم",
        nameKey: "Bots.Bot.Karim.Name",
        rating: 800,
        description: "ربات مبتدی با دانش پایه شطرنج.",
        descriptionKey: "Bots.Bot.Karim.Desc",
        category: "Beginner",
        image: "/bots/beginner/karim.png",
    },
];

// ============================================================
// INTERMEDIATE BOTS (800-1200 Elo)
// ============================================================
export const INTERMEDIATE_BOTS: Bot[] = [
    {
        id: "Maria-Bot",
        name: "ماریا",
        nameKey: "bot.name.maria",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.maria",
        category: "Intermediate",
        image: "/bots/intermediate/maria.png",
    },
    {
        id: "Maxim-Bot",
        name: "ماکسیم",
        nameKey: "bot.name.maxim",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.maxim",
        category: "Intermediate",
        image: "/bots/intermediate/maxim.png",
    },
    {
        id: "Hans-Bot",
        name: "هانس",
        nameKey: "bot.name.hans",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.hans",
        category: "Intermediate",
        image: "/bots/intermediate/hans.png",
    },
    {
        id: "Azeez-Bot",
        name: "عزیز",
        nameKey: "bot.name.azeez",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.azeez",
        category: "Intermediate",
        image: "/bots/intermediate/azeez.png",
    },
    {
        id: "Laura-Bot",
        name: "لورا",
        nameKey: "bot.name.laura",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.laura",
        category: "Intermediate",
        image: "/bots/intermediate/laura.png",
    },
    {
        id: "Sven-Bot",
        name: "سون",
        nameKey: "bot.name.sven",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.sven",
        category: "Intermediate",
        image: "/bots/intermediate/sven.png",
    },
    {
        id: "Emir-Bot",
        name: "امیر",
        nameKey: "bot.name.emir",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.emir",
        category: "Intermediate",
        image: "/bots/intermediate/emir.png",
    },
    {
        id: "Elena-Bot",
        name: "النا",
        nameKey: "bot.name.elena",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.elena",
        category: "Intermediate",
        image: "/bots/intermediate/elena.png",
    },
    {
        id: "Wilson-Bot",
        name: "ویلسون",
        nameKey: "bot.name.wilson",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.wilson",
        category: "Intermediate",
        image: "/bots/intermediate/wilson.png",
    },
    {
        id: "Vinh-Bot",
        name: "وین",
        nameKey: "bot.name.vinh",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.vinh",
        category: "Intermediate",
        image: "/bots/intermediate/vinh.png",
    },
    {
        id: "Nelson-Bot",
        name: "نلسون",
        nameKey: "bot.name.nelson",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.nelson",
        category: "Intermediate",
        image: "/bots/intermediate/nelson.png",
    },
    {
        id: "Jade-Bot",
        name: "جِید",
        nameKey: "bot.name.jade",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.jade",
        category: "Intermediate",
        image: "/bots/intermediate/jade.png",
    },
    {
        id: "David-Bot",
        name: "دیوید",
        nameKey: "bot.name.david",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.david",
        category: "Intermediate",
        image: "/bots/intermediate/david.png",
    },
    {
        id: "Ali-Bot",
        name: "علی",
        nameKey: "bot.name.ali",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.ali",
        category: "Intermediate",
        image: "/bots/intermediate/ali.png",
    },
    {
        id: "Mateo-Bot",
        name: "متیو",
        nameKey: "bot.name.mateo",
        rating: 1500,
        description: "",
        descriptionKey: "bot.description.mateo",
        category: "Intermediate",
        image: "/bots/intermediate/mateo.png",
    },
];

// ============================================================
// ADVANCED BOTS (1200-1600 Elo)
// ============================================================
export const ADVANCED_BOTS: Bot[] = [
    {
        id: "wendy-bot",
        name: "وندی",
        nameKey: "bot.name.wendy",
        rating: 1750,
        description: "رباتی پیشرفته با گرایش تهاجمی و توان بالا در تاکتیک‌های موقعیتی؛ مناسب برای بازیکنان میانه‌تاپیشرفته که دنبال تمرین محاسبات تاکتیکی هستند.",
        descriptionKey: "bot.description.wendy",
        category: "Advanced",
        image: "/bots/advanced/wendy.png",
        greeting: "bot.greeting.wendy"
    },
    {
        id: "Antonio-Bot",
        name: "آنتونیو",
        nameKey: "bot.name.antonio",
        rating: 1850,
        description: "رباتی با سبک بازی متعادل و استحکام موقعیتی؛ کمتر ریسک‌پذیر و مناسب برای تمرین خط‌مشی‌های پوزیسیونی.",
        descriptionKey: "bot.description.antonio",
        category: "Advanced",
        image: "/bots/advanced/antonio.png",
        country: "es",
        greeting: "bot.greeting.antonio"
    },
    {
        id: "Pierre-Bot",
        name: "پیر",
        nameKey: "bot.name.pierre",
        rating: 1900,
        description: "رباتی تکنیکی و محاسباتی که به برنامه‌ریزی بلندمدت و اجرای طرح‌های میانه‌بازی توجه دارد؛ مناسب برای تمرین بازی موقعیتی و انتهای بازی.",
        descriptionKey: "bot.description.pierre",
        category: "Advanced",
        image: "/bots/advanced/pierre.png",
        country: "fr",
        greeting: "bot.greeting.pierre"
    },
    {
        id: "Pablo-Bot",
        name: "پابلو",
        nameKey: "bot.name.pablo",
        rating: 1700,
        description: "رباتی هجومی-تاکتیکی که در موقعیت‌های باز بسیار خطرناک است؛ برای تمرین حمله و محاسبات ترکیبی مناسب است.",
        descriptionKey: "bot.description.pablo",
        category: "Advanced",
        image: "/bots/advanced/pablo.png",
        country: "es",
        greeting: "bot.greeting.pablo"
    },
    {
        id: "Joel-Bot",
        name: "جول",
        nameKey: "bot.name.joel",
        rating: 1800,
        description: "رباتی با سبک همه‌کاره که تعادل خوبی بین تاکتیک و پوزیسیون دارد؛ گزینه‌ای مناسب برای بازیکنانی که می‌خواهند جنبه‌های مختلف بازی را تمرین کنند.",
        descriptionKey: "bot.description.joel",
        category: "Advanced",
        image: "/bots/advanced/joel.png",
        greeting: "bot.greeting.joel"
    },
    {
        id: "Isabel-Bot",
        name: "ایزابل",
        nameKey: "bot.name.isabel",
        rating: 1950,
        description: "رباتی با دقت بالا در محاسبات و تسلط بر انتهای بازی؛ برای تمرین تبدیل مزیت به پیروزی و مطالعه انتهای بازی مناسب است.",
        descriptionKey: "bot.description.isabel",
        category: "Advanced",
        image: "/bots/advanced/isabel.png",
        country: "es",
        greeting: "bot.greeting.isabel"
    },
    {
        id: "Arthur-Bot",
        name: "آرتور",
        nameKey: "bot.name.arthur",
        rating: 2000,
        description: "رباتی کلاسیک و ساخت‌یافته که به اصول بنیادین شطرنج پایبند است؛ مناسب برای آشنایی با خطوط اصلی و استراتژی‌های کلاسیک.",
        descriptionKey: "bot.description.arthur",
        category: "Advanced",
        image: "/bots/advanced/arthur.png",
        country: "gb",
        greeting: "bot.greeting.arthur"
    },
    {
        id: "Jonas-Bot",
        name: "جوناس",
        nameKey: "bot.name.jonas",
        rating: 1780,
        description: "رباتی منعطف که بین بازی حفاظتی و هجومی تغییر سبک می‌دهد؛ برای بررسی پاسخ‌های مختلف به گشایش‌های متنوع مناسب است.",
        descriptionKey: "bot.description.jonas",
        category: "Advanced",
        image: "/bots/advanced/jonas.png",
        country: "se",
        greeting: "bot.greeting.jonas"
    },
    {
        id: "Isla-Bot",
        name: "ایسلا",
        nameKey: "bot.name.isla",
        rating: 1670,
        description: "رباتی که تمایل به بازی باز و پویایی دارد؛ مناسب برای تمرین بازی‌های تاکتیکی و تمرکز بر محاسبات کوتاه‌مدت.",
        descriptionKey: "bot.description.isla",
        category: "Advanced",
        image: "/bots/advanced/isla.png",
        greeting: "bot.greeting.isla"
    },
    {
        id: "Lorenzo-Bot",
        name: "لورنزو",
        nameKey: "bot.name.lorenzo",
        rating: 1820,
        description: "رباتی با تاکید بر بازی موقعیتی و مدیریت ساختار پیاده؛ برای تمرین برنامه‌ریزی میانه‌بازی مناسب است.",
        descriptionKey: "bot.description.lorenzo",
        category: "Advanced",
        image: "/bots/advanced/lorenzo.png",
        country: "it",
        greeting: "bot.greeting.lorenzo"
    },
    {
        id: "Wally-Bot",
        name: "والی",
        nameKey: "bot.name.wally",
        rating: 1600,
        description: "رباتی نسبتاً سازگار برای تمرین بازیکنانی که می‌خواهند در برابر بازی‌های غیرمنتظره و اشتباهات حریف تمرین کنند.",
        descriptionKey: "bot.description.wally",
        category: "Advanced",
        image: "/bots/advanced/wally.png",
        greeting: "bot.greeting.wally"
    },
    {
        id: "Julia-Bot",
        name: "جولیا",
        nameKey: "bot.name.julia",
        rating: 1880,
        description: "رباتی دقیق با توانایی‌های تاکتیکی و استراتژیک؛ مناسب برای تمرین هماهنگی حمله و دفاع در میانه‌بازی.",
        descriptionKey: "bot.description.julia",
        category: "Advanced",
        image: "/bots/advanced/julia.png",
        country: "de",
        greeting: "bot.greeting.julia"
    },
    {
        id: "Miguel-Bot",
        name: "میگل",
        nameKey: "bot.name.miguel",
        rating: 1740,
        description: "رباتی هجومی با تمایل به ایجاد پیچیدگی‌های تاکتیکی؛ برای تمرین حملات برنده‌ساز و محاسبات ترکیبی مناسب است.",
        descriptionKey: "bot.description.miguel",
        category: "Advanced",
        image: "/bots/advanced/miguel.png",
        country: "es",
        greeting: "bot.greeting.miguel"
    },
    {
        id: "Xavier-Bot",
        name: "خاویر",
        nameKey: "bot.name.xavier",
        rating: 1920,
        description: "رباتی فنی با تمرکز بر دقت محاسبات و برنامه‌ریزی؛ مناسب برای تمرین بازی‌های پیچیده و حفظ مزیت فنی.",
        descriptionKey: "bot.description.xavier",
        category: "Advanced",
        image: "/bots/advanced/xavier.png",
        country: "fr",
        greeting: "bot.greeting.xavier"
    },
    {
        id: "Olga-Bot",
        name: "اولگا",
        nameKey: "bot.name.olga",
        rating: 1700,
        description: "رباتی که ترکیبی از بازی دفاعی قوی و حملات سریع را ارائه می‌دهد؛ برای تمرین واکنش به تهدیدات ناگهانی مناسب است.",
        descriptionKey: "bot.description.olga",
        category: "Advanced",
        image: "/bots/advanced/olga.png",
        country: "ru",
        greeting: "bot.greeting.olga"
    },
    {
        id: "Li-Bot",
        name: "لی",
        nameKey: "bot.name.li",
        rating: 1650,
        description: "رباتی چابک با تمایل به بازی‌های ترکیبی سریع؛ برای تمرین تاکتیک‌های موقعیتی و محاسبات سریع مناسب است.",
        descriptionKey: "bot.description.li",
        category: "Advanced",
        image: "/bots/advanced/li.png",
        country: "cn",
        greeting: "bot.greeting.li"
    },
    {
        id: "Charles-Bot",
        name: "چارلز",
        nameKey: "bot.name.charles",
        rating: 1970,
        description: "رباتی با سبک کلاسیک و تیز در محاسبات؛ مناسب برای بازیکنانی که می‌خواهند با سبک اصولی و دقیق تمرین کنند.",
        descriptionKey: "bot.description.charles",
        category: "Advanced",
        image: "/bots/advanced/charles.png",
        country: "gb",
        greeting: "bot.greeting.charles"
    },
    {
        id: "Fatima-Bot",
        name: "فاطیما",
        nameKey: "bot.name.fatima",
        rating: 1680,
        description: "رباتی چندوجهی با واکنش‌های هوشمندانه به اشتباهات حریف؛ برای تمرین بهره‌برداری از موقعیت‌های کوچک مناسب است.",
        descriptionKey: "bot.description.fatima",
        category: "Advanced",
        image: "/bots/advanced/fatima.png",
        greeting: "bot.greeting.fatima"
    },
    {
        id: "Manuel-Bot",
        name: "مانوئل",
        nameKey: "bot.name.manuel",
        rating: 1830,
        description: "رباتی با استحکام پوزیسیونی و توانایی بازی در سطوح میانه تا پیشرفته؛ مناسب برای تمرین ساختارهای پیاده و میانه‌بازی.",
        descriptionKey: "bot.description.manuel",
        category: "Advanced",
        image: "/bots/advanced/manuel.png",
        country: "es",
        greeting: "bot.greeting.manuel"
    },
    {
        id: "Oscar-Bot",
        name: "اسکار",
        nameKey: "bot.name.oscar",
        rating: 1760,
        description: "رباتی منعطف با قابلیت ایجاد فشار در میانه‌بازی و تبدیل اشتباهات حریف به برتری؛ مناسب برای تمرین فشار مداوم.",
        descriptionKey: "bot.description.oscar",
        category: "Advanced",
        image: "/bots/advanced/oscar.png",
        greeting: "bot.greeting.oscar"
    }
];

// ============================================================
// MASTER BOTS (1600-2200 Elo)
// ============================================================
export const MASTER_BOTS: Bot[] = [
    {
        id: "nora-master-001",
        name: "نورا",
        nameKey: "bot.name.nora",
        rating: 2600,
        description: "یک استاد تهاجمی با گرایش به بازی ترکیبی و حملات سریع؛ رفتار آموزشی دارد و پس از هر اشتباه، توضیح مختصر می‌دهد.",
        descriptionKey: "bot.description.nora",
        category: "Master",
        image: "/bots/master/nora.png",
        country: "us",
        greeting: "bot.greeting.nora"
    },
    {
        id: "noam-master-002",
        name: "نوآم",
        nameKey: "bot.name.noam",
        rating: 2700,
        description: "استادی محاسبه‌گر و دفاعی که تکیه‌گاه استراتژی طولانی‌مدت است؛ مناسب بازیکنانی که می‌خواهند محاسبات انتهایی را تقویت کنند.",
        descriptionKey: "bot.description.noam",
        category: "Master",
        image: "/bots/master/noam.png",
        country: "il",
        greeting: "bot.greeting.noam"
    },
    {
        id: "ahmed-master-003",
        name: "احمد",
        nameKey: "bot.name.ahmed",
        rating: 2550,
        description: "استادی متعادل با اولویت کنترل مرکز و بازی پوزیسیونی؛ توضیحات کوتاه‌وکاربردی در مورد اشتباهات می‌دهد.",
        descriptionKey: "bot.description.ahmed",
        category: "Master",
        image: "/bots/master/ahmed.png",
        country: "eg",
        greeting: "bot.greeting.ahmed"
    },
    {
        id: "sakura-master-004",
        name: "ساکورا",
        nameKey: "bot.name.sakura",
        rating: 2500,
        description: "رویکرد خلاقانه و دید تاکتیکی بالا؛ ترکیب‌های غیرمتعارف را دوست دارد و برای تمرین تاکتیک مناسب است.",
        descriptionKey: "bot.description.sakura",
        category: "Master",
        image: "/bots/master/sakura.png",
        country: "jp",
        greeting: "bot.greeting.sakura"
    },
    {
        id: "arjun-master-005",
        name: "آرجون",
        nameKey: "bot.name.arjun",
        rating: 2650,
        description: "استادی محکم با مبانی نظری قوی؛ به بازیکنان کمک می‌کند ایده‌های بازی وسط را بهتر درک کنند و پایان‌بازی‌ها را تقویت می‌کند.",
        descriptionKey: "bot.description.arjun",
        category: "Master",
        image: "/bots/master/arjun.png",
        country: "in",
        greeting: "bot.greeting.arjun"
    },
    {
        id: "francis-master-006",
        name: "فرانسیس",
        nameKey: "bot.name.francis",
        rating: 2620,
        description: "رویه‌ای متفکر و حساب‌شده؛ مناسب برای مطالعه بازی‌های استراتژیک و بازنمایی ایده‌های کلاسیک شطرنج.",
        descriptionKey: "bot.description.francis",
        category: "Master",
        image: "/bots/master/francis.png",
        country: "fr",
        greeting: "bot.greeting.francis"
    },
    {
        id: "sofia-master-007",
        name: "صوفیا",
        nameKey: "bot.name.sofia",
        rating: 2580,
        description: "سبک بازی انعطاف‌پذیر؛ ترکیبی از برنامه‌ریزی پوزیسیونی و واکنش‌های تاکتیکی سریع، مناسب بازیکنان میانی-پیشرفته.",
        descriptionKey: "bot.description.sofia",
        category: "Master",
        image: "/bots/master/sofia.png",
        country: "bg",
        greeting: "bot.greeting.sofia"
    },
    {
        id: "alexander-master-008",
        name: "الکساندر",
        nameKey: "bot.name.alexander",
        rating: 2680,
        description: "بسیار محاسبه‌گر و دقیق؛ بازی‌های انتهایی قوی و توانایی برنامه‌ریزی پیچیده تاکتیکی دارد.",
        descriptionKey: "bot.description.alexander",
        category: "Master",
        image: "/bots/master/alexander.png",
        country: "ru",
        greeting: "bot.greeting.alexander"
    },
    {
        id: "luke-master-009",
        name: "لوک",
        nameKey: "bot.name.luke",
        rating: 2490,
        description: "رویکرد تهاجمی‌تر نسبت به میانگین؛ برای تمرین حملات و موقعیت‌های باز مناسب است.",
        descriptionKey: "bot.description.luke",
        category: "Master",
        image: "/bots/master/luke.png",
        country: "gb",
        greeting: "bot.greeting.luke"
    },
    {
        id: "wei-master-010",
        name: "وی",
        nameKey: "bot.name.wei",
        rating: 2630,
        description: "استادی سریع‌العمل با تبحر در تاکتیک‌های باز؛ مناسب تمرین تاکتیک‌های پیچیده و موقعیت‌های پویا.",
        descriptionKey: "bot.description.wei",
        category: "Master",
        image: "/bots/master/wei.png",
        country: "cn",
        greeting: "bot.greeting.wei"
    }
];

// ============================================================
// CHAMPIONS (2200-2700 Elo)
// ============================================================
export const CHAMPION_BOTS: Bot[] = [
    {
        id: "Aerial-Powers-BOT",
        name: "Aerial Powers",
        nameKey: "bot.name.Aerial-Powers-BOT",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with Aerial Powers. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.Aerial-Powers-BOT",
        category: "Champions",
        image: "/bots/champions/aerial-powers-bot.png",
        greeting: "bot.greeting.Aerial-Powers-BOT"
    },
    {
        id: "Justin-Reid-BOT",
        name: "Justin Reid",
        nameKey: "bot.name.Justin-Reid-BOT",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with Justin Reid. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.Justin-Reid-BOT",
        category: "Champions",
        image: "/bots/champions/justin-reid-bot.png",
        greeting: "bot.greeting.Justin-Reid-BOT"
    },
    {
        id: "JosephVottoBot",
        name: "Joey Votto",
        nameKey: "bot.name.JosephVottoBot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with Joey Votto. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.JosephVottoBot",
        category: "Champions",
        image: "/bots/champions/josephvottobot.png",
        greeting: "bot.greeting.JosephVottoBot"
    },
    {
        id: "LarryFitzgeraldBot",
        name: "لری فیتزجرالد کوچک",
        nameKey: "bot.name.LarryFitzgeraldBot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with لری فیتزجرالد کوچک. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.LarryFitzgeraldBot",
        category: "Champions",
        image: "/bots/champions/larryfitzgeraldbot.png",
        greeting: "bot.greeting.LarryFitzgeraldBot"
    },
    {
        id: "jaylen-brown",
        name: "جایلن براون",
        nameKey: "bot.name.jaylen-brown",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with جایلن براون. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.jaylen-brown",
        category: "Champions",
        image: "/bots/champions/jaylen-brown.png",
        greeting: "bot.greeting.jaylen-brown"
    },
    {
        id: "Drue-Tranquill-BOT",
        name: "Drue Tranquill",
        nameKey: "bot.name.Drue-Tranquill-BOT",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with Drue Tranquill. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.Drue-Tranquill-BOT",
        category: "Champions",
        image: "/bots/champions/drue-tranquill-bot.png",
        greeting: "bot.greeting.Drue-Tranquill-BOT"
    },
    {
        id: "GordonHaywardBot",
        name: "گوردون هیوارد",
        nameKey: "bot.name.GordonHaywardBot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with گوردون هیوارد. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.GordonHaywardBot",
        category: "Champions",
        image: "/bots/champions/gordonhaywardbot.png",
        greeting: "bot.greeting.GordonHaywardBot"
    },
    {
        id: "chidobe-awuziebot",
        name: "چیدوب آوزی",
        nameKey: "bot.name.chidobe-awuziebot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with چیدوب آوزی. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.chidobe-awuziebot",
        category: "Champions",
        image: "/bots/champions/chidobe-awuziebot.png",
        greeting: "bot.greeting.chidobe-awuziebot"
    },
    {
        id: "christian-pulisic-bot",
        name: "کریستین پولیسیچ",
        nameKey: "bot.name.christian-pulisic-bot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with کریستین پولیسیچ. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.christian-pulisic-bot",
        category: "Champions",
        image: "/bots/champions/christian-pulisic-bot.png",
        greeting: "bot.greeting.christian-pulisic-bot"
    },
    {
        id: "jaime-jaquez-jr-BOT",
        name: "Jaime Jaquez Jr.",
        nameKey: "bot.name.jaime-jaquez-jr-BOT",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with Jaime Jaquez Jr.. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.jaime-jaquez-jr-BOT",
        category: "Champions",
        image: "/bots/champions/jaime-jaquez-jr-bot.png",
        greeting: "bot.greeting.jaime-jaquez-jr-BOT"
    },
    {
        id: "DarylMoreyBot",
        name: "دریل موری",
        nameKey: "bot.name.DarylMoreyBot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with دریلی موری. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.DarylMoreyBot",
        category: "Champions",
        image: "/bots/champions/darylmoreybot.png",
        greeting: "bot.greeting.DarylMoreyBot"
    },
    {
        id: "LukAIbot",
        name: "لوک اِی‌آی",
        nameKey: "bot.name.LukAIbot",
        rating: 2500,
        description: "Enjoy a friendly game of computer chess with لوک اِی‌آی. Have a fun and engaging chess experience and see whether you can win vs. the bot.",
        descriptionKey: "bot.description.LukAIbot",
        category: "Champions",
        image: "/bots/champions/lukAIbot.png",
        greeting: "bot.greeting.LukAIbot"
    }
];

// ============================================================
// MUSICIANS
// ============================================================
export const MUSICIAN_BOTS: Bot[] = [
    {
        id: "ThomasMarsBot",
        name: "Thomas Mars",
        nameKey: "bot.thomas_mars.name",
        rating: 2000,
        description: "توماس مارس، خوانندهٔ اصلی گروه ایندی-پاپ/راک فرانسوی Phoenix. شناخته‌شده برای صدای ملایم و ملودی‌های دقیق، نقش محوری در آثار گروه و همکاری‌های هنری متعدد در موسیقی معاصر.",
        descriptionKey: "bot.thomas_mars.description",
        category: "Musicians",
        image: "/bots/musicians/thomasmarsbot.png",
        country: "fr",
        greeting: "bot.thomas_mars.greeting"
    },
    {
        id: "steve-aoki-BOT",
        name: "Steve Aoki",
        nameKey: "bot.steve_aoki.name",
        rating: 2000,
        description: "استیو آوکی، دی‌جی و تهیه‌کنندهٔ موسیقی الکترونیک آمریکایی و بنیان‌گذار لیبل Dim Mak. مشهور به اجراهای پرانرژی، همکاری با هنرمندان گوناگون و رفتارهای نمایشی در سن مثل پرتاب کیک در کنسرت‌ها.",
        descriptionKey: "bot.steve_aoki.description",
        category: "Musicians",
        image: "/bots/musicians/steve-aoki-bot.png",
        country: "us",
        greeting: "bot.steve_aoki.greeting"
    },
    {
        id: "logic-BOT",
        name: "Logic",
        nameKey: "bot.logic.name",
        rating: 2000,
        description: "Logic، رپر و خوانندهٔ آمریکایی شناخته‌شده برای فلوهای سریع، روایت‌های شخصی در ترانه‌ها و آلبوم‌های پُرطرفدار که عناصر هیپ‌هاپ کلاسیک و معاصر را ترکیب می‌کنند.",
        descriptionKey: "bot.logic.description",
        category: "Musicians",
        image: "/bots/musicians/logic-bot.png",
        country: "us",
        greeting: "bot.logic.greeting"
    },
    {
        id: "wallows-BOT",
        name: "Wallows",
        nameKey: "bot.wallows.name",
        rating: 2000,
        description: "Wallows، گروه ایندی راک/پاپ آمریکایی از لس‌آنجلس، شناخته‌شده برای آهنگ‌های ملودیک، فضاسازی نوستالژیک و حضور باثبات در صحنهٔ موسیقی مستقل معاصر.",
        descriptionKey: "bot.wallows.description",
        category: "Musicians",
        image: "/bots/musicians/wallows-bot.png",
        country: "us",
        greeting: "bot.wallows.greeting"
    },
];


// ============================================================
// TOP PLAYERS (Historical/Famous)
// ============================================================
export const TOP_PLAYER_BOTS: Bot[] = [
    {
        id: "Hikaru-bot",
        name: "هیکارو",
        nameKey: "bot.hikaru.name",
        rating: 2775,
        description: "هیکارو ناکامورا — استاد بزرگ (GM) آمریکایی، متخصص شطرنج سریع و بلیتس؛ شناخته‌شده برای سبک تهاجمی و حضور گسترده در بازی‌های آنلاین. (رتبهٔ عددی تقریباً نشان‌دهندهٔ توانایی بات است.)",
        descriptionKey: "bot.hikaru.description",
        category: "TopPlayers",
        image: "/bots/top_players/Hikaru-bot.png",
        country: "us",
        greeting: "bot.hikaru.greeting",
        cardStyle: "golden"
    },
    {
        id: "AnnaMuzychukBot",
        name: "آنا موزیچوک",
        nameKey: "bot.annamuzychuk.name",
        rating: 2550,
        description: "آنا موزیچوک — استاد بزرگ زنی (WGM/GM) اوکراینی، قهرمان مسابقات قهرمانی زنان در کنترل سریع؛ شناخته‌شده برای تسلط در مراحل میانی بازی و آمادگی مسابقاتی. (رتبهٔ تقریبی برای نمایندگی توانایی بات ذکر شده.)",
        descriptionKey: "bot.annamuzychuk.description",
        category: "TopPlayers",
        image: "/bots/top_players/AnnaMuzychukBot.png",
        country: "ua",
        greeting: "bot.annamuzychuk.greeting"
    },
    {
        id: "Vishy-Bot",
        name: "ویشی",
        nameKey: "bot.vishy.name",
        rating: 2755,
        description: "ویشواناثان (ویشی) اناند — استاد بزرگ هندی و قهرمان سابق جهان؛ بات نمایندهٔ سبک عمیق و تجربهٔ بالای مسابقاتی است. (رتبهٔ تقریبی)",
        descriptionKey: "bot.vishy.description",
        category: "TopPlayers",
        image: "/bots/top_players/Vishy-Bot.png",
        country: "in",
        greeting: "bot.vishy.greeting"
    },
    {
        id: "DingLirenBot",
        name: "دینگ لیرن",
        nameKey: "bot.dingliren.name",
        rating: 2790,
        description: "دینگ لیرن — استاد بزرگ چینی و قهرمان سابق جهان؛ شناخته‌شده برای بازی خالص، فنی و پایدار در سطوح بالای بازی. (رتبهٔ تقریبی)",
        descriptionKey: "bot.dingliren.description",
        category: "TopPlayers",
        image: "/bots/top_players/DingLirenBot.png",
        country: "cn",
        greeting: "bot.dingliren.greeting"
    },
    {
        id: "Caruanabot",
        name: "فابیانو",
        nameKey: "bot.caruanabot.name",
        rating: 2815,
        description: "فابیانو کاروآنا — استاد بزرگ آمریکایی (اصل ایتالیایی/ایتالیا‌زادهٔ ایتالیا/اکنون در آمریکا بازی می‌کند)، شناخته‌شده برای بازی‌های فنی و آمادگی بالای بازکردن؛ باتی با سطح قوی محاسباتی. (رتبهٔ تقریبی)",
        descriptionKey: "bot.caruanabot.description",
        category: "TopPlayers",
        image: "/bots/top_players/Caruanabot.png",
        country: "us",
        greeting: "bot.caruanabot.greeting",
        cardStyle: "golden"
    },
    {
        id: "Kosteniuk-Bot",
        name: "کاستنیوک",
        nameKey: "bot.kosteniuk.name",
        rating: 2520,
        description: "الکساندرا کاستنیوک — استاد بزرگ زن روسی و قهرمان سابق زنان جهان؛ بات نمایانگر تجربهٔ تهاجمی و دانش عمیق خط‌های نظری است. (رتبهٔ تقریبی)",
        descriptionKey: "bot.kosteniuk.description",
        category: "TopPlayers",
        image: "/bots/top_players/Kosteniuk-Bot.png",
        country: "ru",
        greeting: "bot.kosteniuk.greeting"
    },
    {
        id: "Naroditsky-Bot",
        name: "دانیا",
        nameKey: "bot.naroditsky.name",
        rating: 2620,
        description: "دنیل نارودیتسکی — استاد بزرگ آمریکایی، استاد و محتواساز شطرنج، شناخته‌شده برای بازی‌های خلاقانه و آموزشی. (رتبهٔ تقریبی)",
        descriptionKey: "bot.naroditsky.description",
        category: "TopPlayers",
        image: "/bots/top_players/Naroditsky-Bot.png",
        country: "us",
        greeting: "bot.naroditsky.greeting"
    },
    {
        id: "NepomniachtchiBot",
        name: "ایان",
        nameKey: "bot.nepomniachtchi.name",
        rating: 2745,
        description: "یان لپونیاچی (نِپو) — استاد بزرگ روسی، شناخته‌شده برای بازی سریع و محاسبات قوی در موقعیت‌های پیچیده. (رتبهٔ تقریبی)",
        descriptionKey: "bot.nepomniachtchi.description",
        category: "TopPlayers",
        image: "/bots/top_players/NepomniachtchiBot.png",
        country: "ru",
        greeting: "bot.nepomniachtchi.greeting"
    },
    {
        id: "AronianBot1",
        name: "آرونیان",
        nameKey: "bot.aronian.name",
        rating: 2760,
        description: "لوون آرونیان — استاد بزرگ با سبک خلاق و تهاجمی؛ نمایندهٔ یکی از برجسته‌ترین شطرنج‌بازان معاصر. (رتبهٔ تقریبی)",
        descriptionKey: "bot.aronian.description",
        category: "TopPlayers",
        image: "/bots/top_players/AronianBot1.png",
        country: "am",
        greeting: "bot.aronian.greeting"
    },
    {
        id: "paulmorphy-BOT",
        name: "پل مورفی",
        nameKey: "bot.paulmorphy.name",
        rating: 2600,
        description: "پل مورفی — استاد تاریخی آمریکایی سدهٔ ۱۹، از پیشگامان شطرنج مدرن. (رتبهٔ عددی ذکرشده تقریب تاریخی برای نمایندگی توانایی بات است؛ طبیعتاً مقایسهٔ مستقیم با ریتینگ‌های مدرن پیچیده است.)",
        descriptionKey: "bot.paulmorphy.description",
        category: "TopPlayers",
        image: "/bots/top_players/paulmorphy-BOT.png",
        country: "us",
        greeting: "bot.paulmorphy.greeting"
    },
    {
        id: "JuditPolgarBot",
        name: "جودیت پولگار",
        nameKey: "bot.juditpolgar.name",
        rating: 2735,
        description: "جودیت پولگار — استاد بزرگ مجارستانی، یکی از قوی‌ترین زنان تاریخ شطرنج که به‌طور مداوم در برابر بهترین‌های جهان بازی کرده است. (رتبهٔ تقریبی)",
        descriptionKey: "bot.juditpolgar.description",
        category: "TopPlayers",
        image: "/bots/top_players/JuditPolgarBot.png",
        country: "hu",
        greeting: "bot.juditpolgar.greeting"
    },
    {
        id: "viditbot",
        name: "ویدیت",
        nameKey: "bot.vidit.name",
        rating: 2710,
        description: "ویدیت گرگِرِسِن — استاد بزرگ هندی، شناخته‌شده برای بازی‌های محاسباتی دقیق و سبک قابل اعتماد در رقابت‌های سطح بالا. (رتبهٔ تقریبی)",
        descriptionKey: "bot.vidit.description",
        category: "TopPlayers",
        image: "/bots/top_players/viditbot.png",
        country: "in",
        greeting: "bot.vidit.greeting"
    },
    {
        id: "IrinaKrushBot",
        name: "ایرینا کراش",
        nameKey: "bot.irinakrush.name",
        rating: 2450,
        description: "ایرینا کراش — استاد بزرگ زن آمریکایی، چندبار قهرمان ملی آمریکا؛ باتی آموزشی و رقابتی با تجربهٔ گستردهٔ تورنمنت. (رتبهٔ تقریبی)",
        descriptionKey: "bot.irinakrush.description",
        category: "TopPlayers",
        image: "/bots/top_players/IrinaKrushBot.png",
        country: "us",
        greeting: "bot.irinakrush.greeting"
    },
    {
        id: "Giri-Bot",
        name: "گیری",
        nameKey: "bot.giri.name",
        rating: 2770,
        description: "آنیش گیری — استاد بزرگ هلندی، شناخته‌شده برای بازی فنی و تسلط نظریهٔ افتتاحیه؛ بات نمایندهٔ سطح بسیار بالا. (رتبهٔ تقریبی)",
        descriptionKey: "bot.giri.description",
        category: "TopPlayers",
        image: "/bots/top_players/Giri-Bot.png",
        country: "nl",
        greeting: "bot.giri.greeting"
    },
    {
        id: "Abdusattorov-Bot",
        name: "عبدالستارف",
        nameKey: "bot.abdusattorov.name",
        rating: 2730,
        description: "رفات عبدالستّروف — استاد بزرگ ازبکستان، قهرمان جوان و تهاجمی معاصر؛ بات نمایانگر سبک سریع و قدرتمند جوانان. (رتبهٔ تقریبی)",
        descriptionKey: "bot.abdusattorov.description",
        category: "TopPlayers",
        image: "/bots/top_players/Abdusattorov-Bot.png",
        country: "uz",
        greeting: "bot.abdusattorov.greeting"
    },
    {
        id: "lasker-BOT",
        name: "Lasker",
        nameKey: "bot.lasker.name",
        rating: 2580,
        description: "اِمانوئل لاسکر — استاد بزرگ تاریخی آلمانی، قهرمان جهان آغاز سدهٔ ۲۰؛ این بات نمایانگر سبک کلاسیک و قواعد تاریخی شطرنج است. (رتبهٔ عددی تقریب تاریخی است.)",
        descriptionKey: "bot.lasker.description",
        category: "TopPlayers",
        image: "/bots/top_players/lasker-BOT.png",
        country: "de",
        greeting: "bot.lasker.greeting"
    },
    {
        id: "HouYifanBot",
        name: "هو یی‌فان",
        nameKey: "bot.houyifan.name",
        rating: 2650,
        description: "هو یی‌فان — استاد بزرگ زن چینی و از بارزترین چهره‌های شطرنج زنان معاصر؛ باتی با پایهٔ قوی نظری و تاکتیکی. (رتبهٔ تقریبی)",
        descriptionKey: "bot.houyifan.description",
        category: "TopPlayers",
        image: "/bots/top_players/HouYifanBot.png",
        country: "cn",
        greeting: "bot.houyifan.greeting"
    },
    {
        id: "bokbot",
        name: "بوک",
        nameKey: "bot.bok.name",
        rating: 2500,
        description: "بوک — بات نمایندهٔ بازیکنی به‌نام 'بوک'؛ توضیحات و منشأ دقیق‌تر بستگی به مرجع داخلی پلتفرم دارد. (رتبهٔ تقریبی برای نمایندگی توانایی بات ذکر شده.)",
        descriptionKey: "bot.bok.description",
        category: "TopPlayers",
        image: "/bots/top_players/bokbot.png",
        country: undefined,
        greeting: "bot.bok.greeting"
    },
    {
        id: "wesleysobot",
        name: "وسلی سو",
        nameKey: "bot.wesleyso.name",
        rating: 2770,
        description: "وسلی سو — استاد بزرگ آمریکایی (اصل فیلیپینی) و بازیکن رده‌بالا؛ باتی با سبک فنی و آمادهٔ رقابت در سطوح بالا. (رتبهٔ تقریبی)",
        descriptionKey: "bot.wesleyso.description",
        category: "TopPlayers",
        image: "/bots/top_players/wesleysobot.png",
        country: "us",
        greeting: "bot.wesleyso.greeting"
    },
    {
        id: "tal-BOT",
        name: "تال",
        nameKey: "bot.tal.name",
        rating: 2650,
        description: "میکائیل تال — استاد بزرگ تاریخی لاتویایی (شهروند سابق اتحاد شوروی) معروف به بازی‌های بسیار تهاجمی و تاکتیکی؛ این بات نمایانگر سبک تهاجمی کلاسیک او است. (رتبهٔ عددی تقریب تاریخی است.)",
        descriptionKey: "bot.tal.description",
        category: "TopPlayers",
        image: "/bots/top_players/tal-BOT.png",
        country: "lv",
        greeting: "bot.tal.greeting"
    },
    {
        id: "capablanca-BOT",
        name: "کاپابلانکا",
        nameKey: "bot.capablanca.name",
        rating: 2680,
        description: "خوسه رائول کاپابلانکا — استاد بزرگ تاریخی کوبایی و قهرمان جهان اوایل سدهٔ ۲۰؛ بات نمایانگر بازی کلاسیک و فنی او است. (رتبهٔ عددی تقریب تاریخی.)",
        descriptionKey: "bot.capablanca.description",
        category: "TopPlayers",
        image: "/bots/top_players/capablanca-BOT.png",
        country: "cu",
        greeting: "bot.capablanca.greeting"
    },
    {
        id: "world-champion-carlsen",
        name: "مگنوس",
        nameKey: "bot.carlsen.name",
        rating: 2882,
        description: "مگنوس کارلسن — استاد بزرگ نروژی و قهرمان جهان؛ یکی از قدرتمندترین بازیکنان تاریخ معاصر که بات نمایانگر سبک همه‌جانبه و درک موقعیتی عمیق او است. (رتبهٔ تقریبی نمایشی توانایی بات.)",
        descriptionKey: "bot.carlsen.description",
        category: "TopPlayers",
        image: "/bots/top_players/world-champion-carlsen.png",
        country: "no",
        greeting: "bot.carlsen.greeting",
        cardStyle: "golden"
    },
    {
        id: "firouzja-bot",
        name: "علیرضا فیروزجا",
        nameKey: "bot.firouzja.name",
        rating: 2804,
        description: "نابغه شطرنج متولد ۱۳۸۲ ایران، ساکن فرانسه؛ جوان‌ترین بازیکن تاریخ با ریتینگ بالای ۲۸۰۰ و مدعی جدی قهرمانی جهان.",
        descriptionKey: "bot.firouzja.description",
        category: "TopPlayers",
        image: "/bots/top_players/firouzjaBot.png",
        country: ["fr", "ir"],
        greeting: "bot.firouzja.greeting",
        cardStyle: "golden"
    }
];


// ============================================================
// ENGINE CATEGORY (Under Development)
// ============================================================
export const ENGINE_BOTS: Bot[] = [];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all bots from all categories
 */
export function getAllBots(): Bot[] {
    return [
        ...BEGINNER_BOTS,
        ...INTERMEDIATE_BOTS,
        ...ADVANCED_BOTS,
        ...MASTER_BOTS,
        ...CHAMPION_BOTS,
        ...MUSICIAN_BOTS,
        ...TOP_PLAYER_BOTS,
        ...ENGINE_BOTS,
    ];
}

/**
 * Get bots filtered by category
 */
export function getBotsByCategory(category: BotCategory): Bot[] {
    switch (category) {
        case "Beginner":
            return BEGINNER_BOTS;
        case "Intermediate":
            return INTERMEDIATE_BOTS;
        case "Advanced":
            return ADVANCED_BOTS;
        case "Master":
            return MASTER_BOTS;
        case "Champions":
            return CHAMPION_BOTS;
        case "Musicians":
            return MUSICIAN_BOTS;
        case "TopPlayers":
            return TOP_PLAYER_BOTS;
        case "Engine":
            return ENGINE_BOTS;
        default:
            return [];
    }
}

/**
 * Get a specific bot by ID
 */
export function getBotById(id: string): Bot | undefined {
    return getAllBots().find(bot => bot.id === id);
}

/**
 * Create a custom bot with specified rating
 */
export function createCustomBot(name: string, rating: number): Bot {
    return {
        id: `custom-${Date.now()}`,
        name,
        nameKey: "",
        rating: Math.max(200, Math.min(3500, rating)),
        description: `Custom bot with ${rating} Elo`,
        descriptionKey: "",
        category: "Custom",
    };
}
