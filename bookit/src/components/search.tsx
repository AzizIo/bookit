import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Search() {
	const [query, setQuery] = useState('')
	const navigate = useNavigate()

	function handleSearch(e: React.FormEvent) {
		e.preventDefault()
		if (query.trim()) {
			navigate(`/booking?q=${encodeURIComponent(query.trim())}`)
			setQuery('')
		}
	}

	return (
		<form onSubmit={handleSearch} className="search-section">
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='Поиск...'
				className='rounded-xl px-4 py-2 border-1 border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] max-w-md w-120'
			/>
		</form>
	)
}
