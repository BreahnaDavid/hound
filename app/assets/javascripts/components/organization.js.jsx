class Organization extends React.Component {
  filterBySearchTerm = (repo) => {
    const { filterTerm } = this.props;
    if (filterTerm == null) {
      return true;
    }

    const repoName = repo.full_github_name.toLowerCase();
    return repoName.indexOf(filterTerm.toLowerCase()) !== -1;
  }

  render = () => {
    const { data, onRepoClicked, isProcessingId, repos } = this.props;

    return (
      <div className="organization">
        <header className="organization-header">
          <h2 className="organization-header-title">{data.name}</h2>
        </header>
        <section className="repo_listing">
          <ul className="repos">
            {repos && repos.filter(this.filterBySearchTerm).map( (repo) => (
              <Repo
                repo={repo}
                key={repo.id}
                onRepoClicked={onRepoClicked}
                isProcessingId={isProcessingId}
              />
            )) || null}
          </ul>
        </section>
      </div>
    );
  }
}
