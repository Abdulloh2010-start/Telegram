import { useRef, useState } from 'react';
import '../styles/support.scss';

const DEST_EMAIL = 'abdullohlalala@gmail.com';

export default function Support() {
  const formRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setLoading(true);
    const action = form.getAttribute('action') || '';
    const emailMatch = action.match(/formsubmit\.co\/(.+)$/);
    const ajaxUrl = emailMatch ? `https://formsubmit.co/ajax/${emailMatch[1]}` : null;
    const fd = new FormData(form);
    try {
      if (!ajaxUrl) throw new Error('AJAX URL not found');
      const res = await fetch(ajaxUrl, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        setSent(true);
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-card">
        <h1 className="support-title">Поддержка</h1>
        <p className="support-desc">Опишите проблему или задайте вопрос — мы ответим вам по почте.</p>

        <div id="register-form" style={{ display: sent ? 'none' : 'block' }}>
          <form
            ref={formRef}
            className="support-form"
            action={`https://formsubmit.co/${DEST_EMAIL}`}
            method="POST"
            onClick={onSubmit}
          >
            <input type="hidden" name="_subject" value="Новая заявка с формы поддержки" />
            <input type="hidden" name="_honey" style={{ display: 'none' }} />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={typeof window !== 'undefined' ? (window.location.origin + window.location.pathname + '#thanks') : '#thanks'} />

            <div className="field">
              <label className="field-label">Имя</label>
              <input className="field-input" name="name" type="text" placeholder="Ваше имя" required />
            </div>

            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="field">
              <label className="field-label">Тема</label>
              <input className="field-input" name="subject" type="text" placeholder="Коротко о проблеме" required />
            </div>

            <div className="field field-full">
              <label className="field-label">Сообщение</label>
              <textarea className="field-textarea" name="message" rows="6" placeholder="Опишите подробно..." required></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-send" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>

        <div id="thanks" style={{ display: sent ? 'block' : 'none' }} className="thanks-block">
          <h2>Заявка принята</h2>
          <p>Спасибо! Мы получили ваше сообщение и свяжемся с вами в ближайшее время.</p>
          <button className="btn-send btn-send--ghost" onClick={() => setSent(false)}>Отправить ещё одну</button>
        </div>
      </div>
    </div>
  );
};