const Search = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="search">
            <div>
                <img src="Search.svg" alt="search" />

                <input type="text"
                    placeholder="Search for thousands of movies"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
    )
}

export default Search;