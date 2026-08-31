import { Language } from './language.enum';


const en = {
  chooseLanguage:
    '🌍 <b>Welcome!</b>\n\nPlease choose your language 👇',
  languageChanged: '✅ Language set to <b>English</b> 🇬🇧',
  welcome:
    '👋 <b>Hi! I watch the official NDRRMA list of rescued people in Nepal.</b>\n\n' +
    '✍️ Just send me a surname (or several — one per line, or separated by commas) and I will save it.\n' +
    '⏱ Every 30 minutes I check the official list and 🔔 notify you as soon as a name matches.\n\n' +
    'ℹ️ Type /help to see all commands.',
  help:
    '🤖 <b>Commands</b>\n\n' +
    '✍️ Send any text — save one or more surnames\n' +
    '📋 /list — my saved surnames\n' +
    '🗑 /remove — remove a surname\n' +
    '🔍 /check — check the list right now\n' +
    '🔔 /notifications — turn notifications on/off\n' +
    '🌍 /language — change language\n' +
    '❓ /help — this message\n\n' +
    '💬 Questions? Feel free to write to the developer: <a href="https://t.me/fransiscodan">@fransiscodan</a> 🙌',
  surnameAdded: '✅ <b>Saved:</b> {surnames}\n\n🔔 I will notify you on any match.',
  surnameDuplicate: 'ℹ️ Already in your list: {surnames}',
  surnameTooShort: '⚠️ A surname must be at least {min} characters long.',
  surnameLimitReached: '🚫 You have reached the limit of {limit} surnames. Remove one with /remove.',
  nothingAdded: '🤔 I could not read a surname there. Please send it as plain text, for example: <code>Sinha</code>',
  listEmpty: '📭 Your list is empty. Send me a surname to start watching 👀',
  listHeader: '📋 <b>Your surnames ({count}):</b>\n{items}',
  removeChoose: '🗑 Which surname should I remove?',
  removed: '🗑 Removed: <b>{surname}</b>',
  removeNotFound: '🤷 That surname is not in your list any more.',
  checkStarted: '🔍 Checking the official list, one moment…',
  checkNoMatches: '😌 No matches for your surnames right now. I keep watching every 30 minutes ⏱',
  checkMatchesFound: '🔔 Found {count} match(es)! Sending the details…',
  checkFailed: '⚠️ The official website is not responding right now. I will retry automatically ⏱',
  notificationsOn: '🔔 Notifications are <b>ON</b>.',
  notificationsOff: '🔕 Notifications are <b>OFF</b>. Turn them back on with /notifications.',
  match:
    '🚨 <b>Match found for “{surname}”!</b>\n\n' +
    '🆔 ID: <b>{id}</b>\n' +
    '👤 Name: <b>{name}</b>\n' +
    '🎂 Age: <b>{age}</b>\n' +
    '⚧️ Gender: <b>{gender}</b>\n\n' +
    '🔗 <a href="{url}">Check here</a>',
  genderMale: 'male 👨',
  genderFemale: 'female 👩',
  genderOther: 'other',
  unknown: 'unknown',
  errorGeneric: '😔 Something went wrong. Please try again.',
  languageButton: '🌍 Language',
};

const uk: typeof en = {
  chooseLanguage: '🌍 <b>Welcome!</b>\n\nPlease choose your language 👇',
  languageChanged: '✅ Мова змінена на <b>українську</b> 🇺🇦',
  welcome:
    '👋 <b>Привіт! Я слідкую за офіційним списком врятованих людей у Непалі (NDRRMA).</b>\n\n' +
    '✍️ Просто надішли мені прізвище (або кілька — кожне з нового рядка чи через кому), і я його збережу.\n' +
    '⏱ Кожні 30 хвилин я перевіряю офіційний список і 🔔 повідомлю тебе, як тільки буде співпадіння.\n\n' +
    'ℹ️ Напиши /help, щоб побачити всі команди.',
  help:
    '🤖 <b>Команди</b>\n\n' +
    '✍️ Надішли будь-який текст — зберегти одне або кілька прізвищ\n' +
    '📋 /list — мої збережені прізвища\n' +
    '🗑 /remove — видалити прізвище\n' +
    '🔍 /check — перевірити список зараз\n' +
    '🔔 /notifications — увімкнути/вимкнути повідомлення\n' +
    '🌍 /language — змінити мову\n' +
    '❓ /help — це повідомлення\n\n' +
    '💬 Будь-які питання? Сміливо пишіть розробнику: <a href="https://t.me/fransiscodan">@fransiscodan</a> 🙌',
  surnameAdded: '✅ <b>Збережено:</b> {surnames}\n\n🔔 Повідомлю про будь-яке співпадіння.',
  surnameDuplicate: 'ℹ️ Уже є у твоєму списку: {surnames}',
  surnameTooShort: '⚠️ Прізвище має містити щонайменше {min} символи.',
  surnameLimitReached: '🚫 Досягнуто ліміт у {limit} прізвищ. Видали одне через /remove.',
  nothingAdded: '🤔 Не вдалося розпізнати прізвище. Надішли його звичайним текстом, наприклад: <code>Sinha</code>',
  listEmpty: '📭 Твій список порожній. Надішли прізвище, щоб почати спостереження 👀',
  listHeader: '📋 <b>Твої прізвища ({count}):</b>\n{items}',
  removeChoose: '🗑 Яке прізвище видалити?',
  removed: '🗑 Видалено: <b>{surname}</b>',
  removeNotFound: '🤷 Цього прізвища більше немає у твоєму списку.',
  checkStarted: '🔍 Перевіряю офіційний список, хвилинку…',
  checkNoMatches: '😌 Зараз співпадінь за твоїми прізвищами немає. Продовжую перевіряти кожні 30 хвилин ⏱',
  checkMatchesFound: '🔔 Знайдено співпадінь: {count}! Надсилаю деталі…',
  checkFailed: '⚠️ Офіційний сайт зараз не відповідає. Я спробую автоматично ще раз ⏱',
  notificationsOn: '🔔 Повідомлення <b>УВІМКНЕНО</b>.',
  notificationsOff: '🔕 Повідомлення <b>ВИКЛЮЧЕНО</b>. Увімкнути знову: /notifications.',
  match:
    '🚨 <b>Знайдено співпадіння за прізвищем «{surname}»!</b>\n\n' +
    '🆔 ID: <b>{id}</b>\n' +
    '👤 Ім’я: <b>{name}</b>\n' +
    '🎂 Вік: <b>{age}</b>\n' +
    '⚧️ Стать: <b>{gender}</b>\n\n' +
    '🔗 <a href="{url}">Перевірте тут</a>',
  genderMale: 'чоловік 👨',
  genderFemale: 'жінка 👩',
  genderOther: 'інша',
  unknown: 'невідомо',
  errorGeneric: '😔 Щось пішло не так. Спробуй ще раз.',
  languageButton: '🌍 Мова',
};

const ru: typeof en = {
  chooseLanguage: '🌍 <b>Welcome!</b>\n\nPlease choose your language 👇',
  languageChanged: '✅ Язык изменён на <b>русский</b> 🇷🇺',
  welcome:
    '👋 <b>Привет! Я слежу за официальным списком спасённых людей в Непале (NDRRMA).</b>\n\n' +
    '✍️ Просто отправь мне фамилию (или несколько — каждую с новой строки либо через запятую), и я её сохраню.\n' +
    '⏱ Каждые 30 минут я проверяю официальный список и 🔔 пришлю уведомление, как только будет совпадение.\n\n' +
    'ℹ️ Напиши /help, чтобы увидеть все команды.',
  help:
    '🤖 <b>Команды</b>\n\n' +
    '✍️ Отправь любой текст — сохранить одну или несколько фамилий\n' +
    '📋 /list — мои сохранённые фамилии\n' +
    '🗑 /remove — удалить фамилию\n' +
    '🔍 /check — проверить список сейчас\n' +
    '🔔 /notifications — включить/выключить уведомления\n' +
    '🌍 /language — изменить язык\n' +
    '❓ /help — это сообщение\n\n' +
    '💬 По любым вопросам — смело пишите разработчику: <a href="https://t.me/fransiscodan">@fransiscodan</a> 🙌',
  surnameAdded: '✅ <b>Сохранено:</b> {surnames}\n\n🔔 Сообщу о любом совпадении.',
  surnameDuplicate: 'ℹ️ Уже есть в твоём списке: {surnames}',
  surnameTooShort: '⚠️ Фамилия должна содержать минимум {min} символа.',
  surnameLimitReached: '🚫 Достигнут лимит в {limit} фамилий. Удали одну через /remove.',
  nothingAdded: '🤔 Не удалось распознать фамилию. Отправь её обычным текстом, например: <code>Sinha</code>',
  listEmpty: '📭 Твой список пуст. Отправь фамилию, чтобы начать наблюдение 👀',
  listHeader: '📋 <b>Твои фамилии ({count}):</b>\n{items}',
  removeChoose: '🗑 Какую фамилию удалить?',
  removed: '🗑 Удалено: <b>{surname}</b>',
  removeNotFound: '🤷 Этой фамилии больше нет в твоём списке.',
  checkStarted: '🔍 Проверяю официальный список, одну минуту…',
  checkNoMatches: '😌 Сейчас совпадений по твоим фамилиям нет. Продолжаю проверять каждые 30 минут ⏱',
  checkMatchesFound: '🔔 Найдено совпадений: {count}! Отправляю детали…',
  checkFailed: '⚠️ Официальный сайт сейчас не отвечает. Я повторю попытку автоматически ⏱',
  notificationsOn: '🔔 Уведомления <b>ВКЛЮЧЕНЫ</b>.',
  notificationsOff: '🔕 Уведомления <b>ВЫКЛЮЧЕНЫ</b>. Включить снова: /notifications.',
  match:
    '🚨 <b>Найдено совпадение по фамилии «{surname}»!</b>\n\n' +
    '🆔 ID: <b>{id}</b>\n' +
    '👤 Имя: <b>{name}</b>\n' +
    '🎂 Возраст: <b>{age}</b>\n' +
    '⚧️ Пол: <b>{gender}</b>\n\n' +
    '🔗 <a href="{url}">Проверьте здесь</a>',
  genderMale: 'мужской 👨',
  genderFemale: 'женский 👩',
  genderOther: 'другой',
  unknown: 'неизвестно',
  errorGeneric: '😔 Что-то пошло не так. Попробуй ещё раз.',
  languageButton: '🌍 Язык',
};

export type TranslationKey = keyof typeof en;

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  [Language.EN]: en,
  [Language.UK]: uk,
  [Language.RU]: ru,
};
