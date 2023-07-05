### Methods:

#### Открытая часть API:

- GET /doctors
- GET /doctors/:id
- GET /doctors/specialties/:specialty

#### Для пациентов:

- GET /patient/me
- POST /patient/login
- POST /patient/register
- **POST /patient/slots**
- DELETE /patient/me
- DELETE /patient/slots/:id

#### Для врачей:

- GET /doctor/me
- GET /doctor/patients/:id
- POST /doctor/login
- POST /doctor/register
- POST /doctor/slots
- DELETE /doctor/me
- DELETE /doctor/slots/:id

---

### NB:

- Только авторизованный пациент может забронировать себе слот.
- Данные пациента могут просматривать только сам пациент и врач, к которому он записан.
- Пациент может отменить запись, освободив слот. Врач может удалить слот, если на него никто не записан.
- Почта и мобильный можно регистрировать дважды: для аккаунта пациента и аккаунта врача.

---

### Что еще можно сделать:

- защита бд,
- редактирование своих персональных данных после регистрации,
- верификация по номеру телефона или почте при регистрации (nodemailer, twilio),
- история записей пациента,
- биография и рейтинг врачей,
- сериализация создания слотов врачом по шаблонам, которые он может создавать и редактировать,
- запрет создавать определенные слоты (напр., если времени между слотами недостаточно для приема, или если слот не вписыавется в часы работы),
- можно разделить получение личных данных врача и данных по его свободным слотам (зависит от того, что нужно фронтенд части),
- поиск доступных слотов по времени, специальности и другим параметрам (а не у конкретного врача),
- отказ от уведомлений...
