class ReposContainer extends React.Component {
  fetchReposAndOrgs = () => {
    $.ajax({
      url: "/repos.json",
      type: "GET",
      dataType: "json",
      success: (data) => {
        this.setState({repos: data});

        organizations = data.map( (repo) => { return repo.owner; });
        this.setState({organizations: _.uniqWith(organizations, _.isEqual)});

        this.setState({isSyncing: false});
      },
      error: (error) => {
        console.log("Error:");
        console.log(error);
      }
    });
  }

  state = {
    isSyncing: false,
    isProcessingId: null,
    filterTerm: null,
    repos: [],
    organizations: []
  }

  componentWillMount = () => {
    $.ajaxSetup({
      headers: {
        "X-XSRF-Token": this.props.authenticity_token
      }
    });
    this.setState({isSyncing: true});
    this.fetchReposAndOrgs();
  }

  onRepoClicked = (id) => {
    this.setState({isProcessingId: id});

    $.ajax({
      url: `/repos/${id}/activation.json`,
      type: "POST",
      error: () => {
        alert("Could not activate repo!");
      }
    });

    this.setState({isProcessingId: null});
  }

  handleSync = () => {
    $.ajax({
      url: "/user.json",
      type: "GET",
      dataType: "json",
      success: (data) => {
        if (data.refreshing_repos) {
          setTimeout(() => { this.handleSync() }, 2000);
        } else {
          this.fetchReposAndOrgs();
        }
      }
    });
  }

  onRefreshClicked = (evt) => {
    this.setState({isSyncing: true});

    $.ajax({
      url: "/repo_syncs.json",
      type: "POST"
    });

    this.handleSync();
  }

  onPrivateClicked = (evt) => {
    $.post("/auth/github?access=full");
  }

  onSearchInput = (term) => {
    this.setState({filterTerm: term});
  }

  render = () => {
    const { has_private_access } = this.props;

    return (
      <div>
        <RepoTools
          showPrivateButton={!has_private_access}
          onSearchInput={this.onSearchInput}
          onRefreshClicked={this.onRefreshClicked}
          onPrivateClicked={this.onPrivateClicked}
          isSyncing={this.state.isSyncing}
        />
        {
          this.state.isSyncing
          ? <ReposSyncSpinner/>
          : <OrganizationsList
              organizations={this.state.organizations}
              repos={this.state.repos}
              filterTerm={this.state.filterTerm}
              onRepoClicked={this.onRepoClicked}
              isProcessingId={this.state.isProcessingId}
            />
        }
      </div>
    );
  }
}
