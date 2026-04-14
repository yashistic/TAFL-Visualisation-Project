import { useNavigate } from 'react-router-dom';

export default function Concepts() {
  const navigate = useNavigate();

  function tryExample() {
    navigate('/', { state: { initialRegex: '(a|b)*' } });
  }

  return (
    <article className="concepts-page">
      <h1>Regex as a formal language</h1>
      <p>
        In this course-style model, a regular expression describes a <strong>language</strong>: a (usually infinite)
        set of strings over an alphabet. Operators build larger languages from smaller ones.
      </p>

     <h2>Operators</h2>
     <ul>
      <li>
       <strong>Union</strong> <code>|</code>: picks between two expressions.  
       For example, <code>a|b</code> means either <code>a</code> or <code>b</code>.
      </li>
      <li>
       <strong>Concatenation</strong> <code>·</code>: placing expressions next to each other.  
       It forms strings by joining one from the left side with one from the right.
      </li>
      <li>
       <strong>Kleene Star</strong> <code>*</code>: repeats an expression any number of times (including zero).  
       For example, <code>a*</code> gives <code>ε, a, aa, aaa, …</code>.
      </li>
    </ul>

      <h2>Infinite languages and bounded views</h2>
      <p>
      Many regular expressions describe <strong>infinite</strong> languages (even a simple Kleene star does this).  
      Since listing every possible string isn’t feasible, the playground works with fixed limits:  
      the generator shows all strings up to length 3, sampling produces additional examples up to length 20,  
      and equivalence checks both expressions using strings up to length 20.
      </p>

      <h2>Example</h2>
      <p>
        The expression <code>(a|b)*</code> denotes all strings over <code>{'{a,b}'}</code>, including the empty string{' '}
        <code>ε</code>. The playground lists short members by length, then you can sample longer examples.
      </p>
      <button type="button" className="btn" onClick={tryExample}>
        Try this example
      </button>

      <div className="credits">
        <p>
          <strong>Credits</strong>
        </p>
        <p>
          <strong>Name:</strong> Yash Mittal
          <br />
          <strong>Roll number:</strong> 2024UCD2113
          <br />
          
        </p>
      </div>
    </article>
  );
}
