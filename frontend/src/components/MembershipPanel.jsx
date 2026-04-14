import { useState } from 'react';

export default function MembershipPanel({ regex, onCheck }) {
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function check() {
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const accepted = await onCheck(testString);
      setResult(accepted);
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

      {/* 🔥 IMPORTANT: keep button class */}
      <button
        type="button"
        className="btn"
        onClick={check}
        disabled={loading}
      >
        {loading ? 'Checking…' : 'Test membership'}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result === true && (
        <p
          className="success-text"
          style={{ fontFamily: 'var(--font-mono)', margin: 0 }}
        >
          Accepted ✓
        </p>
      )}

      {result === false && (
        <p
          className="reject-text"
          style={{ fontFamily: 'var(--font-mono)', margin: 0 }}
        >
          Rejected ✗
        </p>
      )}

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
        Uses the same regex as the generator field above.
      </p>
    </section>
  );
}