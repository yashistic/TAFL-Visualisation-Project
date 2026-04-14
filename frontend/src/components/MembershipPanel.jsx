import { useState } from 'react';

export default function MembershipPanel({ regex }) {
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function check() {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regex, string: testString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data.accepted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <p className="panel-label">Membership</p>
      <h2>Does a string belong to L(r)?</h2>
      <div className="field">
        <label htmlFor="mem-str">Input string</label>
        <input
          id="mem-str"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="aba"
          spellCheck={false}
        />
      </div>
      <button type="button" className="btn" onClick={check} disabled={loading}>
        {loading ? 'Checking…' : 'Test membership'}
      </button>
      {error ? <p className="error-text">{error}</p> : null}
      {result === true ? (
        <p className="success-text" style={{ fontFamily: 'var(--font-mono)', margin: 0 }}>
          Accepted ✓
        </p>
      ) : null}
      {result === false ? (
        <p className="reject-text" style={{ fontFamily: 'var(--font-mono)', margin: 0 }}>
          Rejected ✗
        </p>
      ) : null}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
        Uses the same regex as the generator field above.
      </p>
    </section>
  );
}
