import { useState } from 'react';

const EQUIVALENCE_MAX_LENGTH = 20;

export default function EquivalencePanel({ onCheck }) {
  const [regex1, setRegex1] = useState('a*');
  const [regex2, setRegex2] = useState('(a*)*');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [equiv, setEquiv] = useState(null);

  async function compare() {
    setError('');
    setLoading(true);
    setEquiv(null);

    try {
      /** 🔥 FIX: use parent API instead of fetch */
      const data = await onCheck(regex1, regex2, EQUIVALENCE_MAX_LENGTH);
      setEquiv(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <p className="panel-label">Equivalence</p>
      <h2>Compare two expressions</h2>

      <div className="field-row">
        <div className="field">
          <label htmlFor="eq-r1">Regex 1</label>
          <input
            id="eq-r1"
            value={regex1}
            onChange={(e) => setRegex1(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor="eq-r2">Regex 2</label>
          <input
            id="eq-r2"
            value={regex2}
            onChange={(e) => setRegex2(e.target.value)}
            spellCheck={false}
          />
        </div>

        <button
          type="button"
          className="btn"
          onClick={compare}
          disabled={loading}
        >
          {loading ? 'Checking…' : 'Check equivalence'}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {equiv ? (
        <>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
            {equiv.equivalent ? (
              <span className="success-text">Equivalent</span>
            ) : (
              <span className="reject-text">Not equivalent</span>
            )}
          </p>

          {!equiv.equivalent ? (
            <div className="output-block compact">
              {equiv.onlyInFirst.length > 0 ? (
                <div className="length-group">
                  <div className="length-label">Only in first:</div>
                  <div className="strings-line">
                    {equiv.onlyInFirst.map((w) => (w === '' ? 'ε' : w)).join(', ')}
                  </div>
                </div>
              ) : null}

              {equiv.onlyInSecond.length > 0 ? (
                <div className="length-group">
                  <div className="length-label">Only in second:</div>
                  <div className="strings-line">
                    {equiv.onlyInSecond.map((w) => (w === '' ? 'ε' : w)).join(', ')}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}