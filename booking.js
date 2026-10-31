(() => {
 'use strict';
 const form = document.querySelector('#lead-form');
 if (!form) return;
 const status = document.querySelector('#form-status');
 const button = form.querySelector('[type="submit"]');
 const endpoint = 'https://meschool.t8s.ru/Api/V2/AddStudyRequest';
 let pending = false;
 let completed = false;
 let requestId;
 const phoneValue = value => {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '8') digits = '7' + digits.slice(1);
  if (digits.length === 10) digits = '7' + digits;
  return /^[1-9]\d{9,14}$/.test(digits) ? '+' + digits : null;
 };
 const phone = form.elements.namedItem('phone');
 phone.addEventListener('input', () => phone.setCustomValidity(''));
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending || completed) return;
  phone.setCustomValidity('');
  const normalized = phoneValue(phone.value);
  if (!normalized) phone.setCustomValidity('Укажите номер телефона с кодом страны, например +7 999 123-45-67.');
  if (!form.reportValidity()) return;
  const firstName = form.elements.namedItem('firstName').value.trim();
  if (!firstName) {
   status.textContent = 'Укажите, пожалуйста, ваше имя.';
   form.elements.namedItem('firstName').focus();
   return;
  }
  if (!form.elements.namedItem('privacy').checked || !form.elements.namedItem('processing').checked) {
   status.textContent = 'Ознакомьтесь с политикой и подтвердите согласие на обработку данных.';
   return;
  }
  requestId ||= globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const now = new Date().toISOString();
  const interest = form.elements.namedItem('interest').value;
  const payload = {
   fullName: firstName,
   phone: normalized,
   discipline: 'Английский',
   location: 'Куркино',
   type: 'Заявка на обучение',
   description: 'Консультация и пробное занятие. Направление: ' + interest + '. Указаны контакты взрослого заявителя.',
   extraData: JSON.stringify({
    source: 'MESCHOOL: новая форма сайта',
    requestId,
    interest,
    consent: { processing: true, privacyAcknowledged: true, submittedAt: now,
     consentVersion: 'consent-2026-10-30', privacyVersion: 'privacy-2026-10-30' }
   }),
   sitePage: location.origin + location.pathname,
   processingConsent: 'Да; consent-2026-10-30; ' + now,
   privacyAcknowledged: 'Да; privacy-2026-10-30'
  };
  // Send only named campaign tags, never all query parameters or the URL fragment.
  const query = new URLSearchParams(location.search);
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content']) {
   const value = query.get(key);
   if (value) payload[key] = value.slice(0, 300);
  }
  pending = true;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Отправляем заявку…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
   const response = await fetch(endpoint, {
    method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
    referrerPolicy: 'strict-origin-when-cross-origin',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(payload), signal: controller.signal
   });
   const result = await response.json();
   if (!response.ok || result?.Error) {
    status.textContent = 'Не удалось отправить заявку. Ваши данные остались в форме. Попробуйте позже или позвоните: +7 (966) 324-14-99.';
    return;
   }
   if (!(Number.isSafeInteger(Number(result?.Id)) && Number(result.Id) > 0)) throw new Error('Unconfirmed CRM response');
   completed = true;
   form.reset();
   status.textContent = 'Спасибо! Заявка отправлена. Администратор свяжется с вами.';
   button.textContent = 'Заявка отправлена';
  } catch {
   // A lost response may follow a successful write. Do not automatically retry.
   status.textContent = 'Не удалось подтвердить отправку. Заявка могла поступить — не отправляйте её повторно сразу. Позвоните нам: +7 (966) 324-14-99.';
  } finally {
   clearTimeout(timeout);
   pending = false;
   button.disabled = completed;
   form.removeAttribute('aria-busy');
  }
 });
})();
