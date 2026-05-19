from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from courses.models import Course
from lessons.models import Lesson, LessonContent
from tests.models import Question, Test

User = get_user_model()


class Command(BaseCommand):
    help = "Demo kurs, dars, kontent va testlarni yaratadi yoki yangilaydi."

    def handle(self, *args, **options):
        teacher, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "first_name": "Platforma",
                "last_name": "Admin",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            teacher.set_password("admin123")
            self.stdout.write(self.style.SUCCESS("Admin yaratildi: admin / admin123"))
        teacher.email = teacher.email or "admin@example.com"
        teacher.first_name = teacher.first_name or "Platforma"
        teacher.last_name = teacher.last_name or "Admin"
        teacher.role = "admin"
        teacher.is_staff = True
        teacher.is_superuser = True
        teacher.save()

        for course_index, course_data in enumerate(self.courses_data(), start=1):
            course, _ = Course.objects.update_or_create(
                title=course_data["title"],
                defaults={
                    "description": course_data["description"],
                    "duration": course_data["duration"],
                    "semester": course_data["semester"],
                    "level": course_data["level"],
                    "objectives": "\n".join(course_data["objectives"]),
                    "expected_outcomes": "\n".join(course_data["outcomes"]),
                    "instructor": teacher,
                },
            )

            for order, lesson_data in enumerate(course_data["lessons"], start=1):
                lesson, _ = Lesson.objects.update_or_create(
                    course=course,
                    order=order,
                    defaults={
                        "title": lesson_data["title"],
                        "description": lesson_data["description"],
                        "duration": lesson_data["duration"],
                        "has_test": True,
                    },
                )

                LessonContent.objects.update_or_create(
                    lesson=lesson,
                    order=1,
                    defaults={
                        "title": f"{lesson.title}: asosiy mavzu",
                        "content_type": "text",
                        "content": lesson_data["content"],
                    },
                )

                test, _ = Test.objects.update_or_create(
                    lesson=lesson,
                    defaults={
                        "title": f"{lesson.title} testi",
                        "description": f"{lesson.title} bo'yicha qisqa tekshiruv testi.",
                        "time_limit": 15,
                        "passing_score": 70,
                        "is_active": True,
                    },
                )
                if lesson.test_id != test.id:
                    lesson.test = test
                    lesson.has_test = True
                    lesson.save(update_fields=["test", "has_test", "updated_at"])

                for question_order, question in enumerate(lesson_data["questions"], start=1):
                    Question.objects.update_or_create(
                        test=test,
                        order=question_order,
                        defaults={
                            "question_text": question["question"],
                            "options": question["options"],
                            "correct_answer": question["options"][question["correct"]],
                        },
                    )

            self.stdout.write(self.style.SUCCESS(f"{course_index}. {course.title} tayyor"))

        self.stdout.write(self.style.SUCCESS("Barcha demo kurslar, darslar va testlar tayyor."))

    def courses_data(self):
        return [
            {
                "title": "Matematika",
                "description": "Algebra, geometriya va funksiyalar bo'yicha akademik litsey kursi.",
                "duration": "12 hafta",
                "semester": "1-semestr",
                "level": "beginner",
                "objectives": [
                    "Algebraik ifodalarni soddalashtirish",
                    "Tenglama va tengsizliklarni yechish",
                    "Funksiya grafiklarini tahlil qilish",
                ],
                "outcomes": ["Masalalarni bosqichma-bosqich yechadi", "Testlarda barqaror natija ko'rsatadi"],
                "lessons": [
                    self.lesson(
                        "Algebraik ifodalar",
                        "Ifodalarni soddalashtirish va ko'paytuvchilarga ajratish.",
                        "Algebraik ifoda sonlar, o'zgaruvchilar va amallardan tuziladi. O'xshash hadlarni qo'shish, qavslarni ochish va formulalardan foydalanish masalani tez va aniq yechishga yordam beradi.",
                        [("(a + b)^2 formulasi qaysi?", ["a^2 + 2ab + b^2", "a^2 + b^2", "a^2 - b^2", "a + b"], 0)],
                    ),
                    self.lesson(
                        "Tenglamalar",
                        "Chiziqli va kvadrat tenglamalarni yechish.",
                        "Tenglama yechimi tenglikni rost qiladigan qiymatdir. Chiziqli tenglamalarda noma'lumni ajratamiz, kvadrat tenglamalarda diskriminant yoki ko'paytuvchilarga ajratishdan foydalanamiz.",
                        [("2x + 3 = 7 tenglamaning yechimi?", ["x = 2", "x = 3", "x = 4", "x = 1"], 0)],
                    ),
                    self.lesson(
                        "Funksiyalar",
                        "Funksiya tushunchasi va grafiklar.",
                        "Funksiya har bir x qiymatga bitta y qiymatni mos qo'yadi. Chiziqli funksiya grafigi to'g'ri chiziq, kvadrat funksiya grafigi parabola bo'ladi.",
                        [("y = 2x + 3 grafigi qanday?", ["To'g'ri chiziq", "Parabola", "Aylana", "Giperbola"], 0)],
                    ),
                ],
            },
            {
                "title": "Fizika",
                "description": "Mexanika, termodinamika va elektromagnetizm asoslari.",
                "duration": "10 hafta",
                "semester": "1-semestr",
                "level": "intermediate",
                "objectives": ["Kuch va harakat qonunlarini tushunish", "Energiya almashinuvini izohlash"],
                "outcomes": ["Formulalarni real masalalarda qo'llaydi", "Fizik jarayonlarni tahlil qiladi"],
                "lessons": [
                    self.lesson("Mexanika asoslari", "Nyuton qonunlari va harakat.", "Mexanika jismlarning harakati va ularga ta'sir qiluvchi kuchlarni o'rganadi. Nyutonning ikkinchi qonuni kuch, massa va tezlanish orasidagi bog'lanishni beradi.", [("Nyutonning ikkinchi qonuni?", ["F = ma", "F = mv", "F = m/a", "F = a/m"], 0)]),
                    self.lesson("Termodinamika", "Issiqlik va temperatura.", "Termodinamika issiqlik, ish va energiya almashinuvini o'rganadi. Ideal gaz holati bosim, hajm va temperatura orqali ifodalanadi.", [("Ideal gaz tenglamasi?", ["PV = nRT", "PV = T", "P + V = nR", "P/V = nR"], 0)]),
                    self.lesson("Elektromagnetizm", "Elektr va magnit maydonlar.", "Elektr zaryadlar maydon hosil qiladi. Magnit oqim o'zgarganda o'tkazgichda induksiya EYuK paydo bo'ladi.", [("Faradey qonuni nimani tushuntiradi?", ["Induksiya EYuK hosil bo'lishini", "Issiqlik ajralishini", "Bosim ortishini", "Massa saqlanishini"], 0)]),
                ],
            },
            {
                "title": "Kimyo",
                "description": "Atom tuzilishi, reaksiyalar va organik kimyo.",
                "duration": "10 hafta",
                "semester": "2-semestr",
                "level": "intermediate",
                "objectives": ["Modda tuzilishini tushunish", "Reaksiya turlarini farqlash"],
                "outcomes": ["Kimyoviy tenglamalarni tahlil qiladi", "Oddiy hisob-kitoblarni bajaradi"],
                "lessons": [
                    self.lesson("Atom va molekula", "Atom tuzilishi va bog'lanishlar.", "Atom proton, neytron va elektronlardan tashkil topadi. Kimyoviy bog'lar atomlarning elektron almashishi yoki bo'lishishi orqali yuzaga keladi.", [("Protonlar soni nima deyiladi?", ["Atom raqami", "Massa raqami", "Valentlik", "Molekula"], 0)]),
                    self.lesson("Kimyoviy reaksiyalar", "Reaksiya turlari va tezligi.", "Kimyoviy reaksiya moddalarning yangi moddalarga aylanishidir. Katalizator reaksiya tezligini oshiradi, lekin sarflanmaydi.", [("Katalizator nima qiladi?", ["Reaksiya tezligini oshiradi", "Reaksiyani to'xtatadi", "Massani yo'qotadi", "Hajmni nol qiladi"], 0)]),
                    self.lesson("Organik kimyo", "Uglerod birikmalari.", "Organik kimyo uglerod birikmalarini o'rganadi. Alkanlar faqat bitta bog'li to'yingan uglevodorodlardir.", [("Alkanlarda qanday bog' ustun?", ["Bitta bog'", "Ikki bog'", "Uch bog'", "Ion bog'"], 0)]),
                ],
            },
            {
                "title": "Ona tili",
                "description": "Imlo, sintaksis va adabiyot asoslari.",
                "duration": "8 hafta",
                "semester": "2-semestr",
                "level": "beginner",
                "objectives": ["Imlo qoidalarini mustahkamlash", "Gap tuzilishini tahlil qilish"],
                "outcomes": ["Matnni ravon yozadi", "Gap bo'laklarini ajratadi"],
                "lessons": [
                    self.lesson("Imlo qoidalari", "To'g'ri yozish me'yorlari.", "Imlo qoidalari so'zlarni adabiy til me'yorlariga mos yozishni belgilaydi. To'g'ri yozish savodxonlikning asosiy ko'rsatkichidir.", [("'Kitob' so'zida nechta harf bor?", ["5", "4", "3", "6"], 0)]),
                    self.lesson("Sintaksis", "Gap va uning bo'laklari.", "Sintaksis so'z birikmasi va gap tuzilishini o'rganadi. Gapning bosh bo'laklari ega va kesim hisoblanadi.", [("Gapning bosh bo'laklari?", ["Ega va kesim", "Aniqlovchi va hol", "Undalma", "Kirish so'z"], 0)]),
                    self.lesson("Adabiyot tarixi", "Mumtoz va zamonaviy adabiyot.", "Adabiyot tarixi ijodkorlar, asarlar va badiiy jarayonlarni davrlar kesimida o'rganadi.", [("Alisher Navoiy qaysi asrda yashagan?", ["XV asr", "XIII asr", "XVII asr", "XX asr"], 0)]),
                ],
            },
            {
                "title": "Tarix",
                "description": "Jahon tarixi va O'zbekiston tarixi bo'yicha tayanch kurs.",
                "duration": "9 hafta",
                "semester": "1-semestr",
                "level": "beginner",
                "objectives": ["Tarixiy davrlarni farqlash", "Sabab-oqibat bog'lanishini tushunish"],
                "outcomes": ["Voqealarni xronologik tartiblaydi", "Manbalarni solishtiradi"],
                "lessons": [
                    self.lesson("Qadimgi sivilizatsiyalar", "Dastlabki davlatlar va madaniyatlar.", "Qadimgi sivilizatsiyalar daryo vodiylarida shakllangan. Mesopotamiya Tigr va Frot oralig'ida joylashgan.", [("Mesopotamiya qayerda joylashgan?", ["Tigr va Frot oralig'ida", "Nil bo'yida", "Amudaryo bo'yida", "Hind okeanida"], 0)]),
                    self.lesson("O'zbekiston tarixi", "Temuriylar va mustaqillik davri.", "O'zbekiston tarixi qadimgi shaharlar, buyuk davlatlar va mustaqillik davridagi taraqqiyot jarayonlarini o'z ichiga oladi.", [("Amir Temur davlatining markazi?", ["Samarqand", "Xiva", "Qo'qon", "Termiz"], 0)]),
                    self.lesson("Zamonaviy jahon tarixi", "XX va XXI asr voqealari.", "Zamonaviy tarix urushlar, xalqaro tashkilotlar, texnologik taraqqiyot va globallashuv jarayonlarini o'rganadi.", [("Ikkinchi jahon urushi qachon tugagan?", ["1945", "1918", "1939", "1991"], 0)]),
                ],
            },
        ]

    def lesson(self, title, description, content, questions, duration="35 daqiqa"):
        return {
            "title": title,
            "description": description,
            "content": content,
            "duration": duration,
            "questions": [
                {"question": question, "options": options, "correct": correct}
                for question, options, correct in questions
            ],
        }
