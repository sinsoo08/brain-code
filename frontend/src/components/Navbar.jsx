import { Link } from 'react-router-dom'

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#2F6FD6',
  padding: '15px 30px',
}

const logoStyle = {
  color: 'white',
  fontSize: '20px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const menuStyle = {
  listStyle: 'none',
  display: 'flex',
  gap: '20px',
  margin: 0,
  padding: 0,
}

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
}

export default function Navbar({ links }) {
  return (
    <nav style={navbarStyle}>
      <Link to="/" style={logoStyle}>브레인 코드</Link>
      <ul style={menuStyle}>
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              style={linkStyle}
              onMouseEnter={e => e.target.style.color = '#ffcc00'}
              onMouseLeave={e => e.target.style.color = 'white'}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
