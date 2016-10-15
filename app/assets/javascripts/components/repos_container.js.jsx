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
        alert("Your repos failed to load.");
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
    let repo = _.find(this.state.repos, {id: id});

    $.ajax({
      url: `/repos/${id}/activation.json`,
      type: "POST",
      success: () => {

      },
      error: () => {
        alert("Your repo failed to activate.");
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
      type: "POST",
      success: () => {
        this.handleSync();
      },
      error: () => {
        this.setState({isSyncing: false});
        alert("Your repos failed to sync.");
      }
    });
  }

  onPrivateClicked = (evt) => {
    $.post("/auth/github?access=full");
  }

  onSearchInput = (term) => {
    this.setState({filterTerm: term});
  }

  track_repo_activated = (repo) => {
    if (repo.private) {
      const eventName = "Private Repo Activated";
      const price = repo.price_in_dollars;
    } else {
      const eventName = "Public Repo Activated";
      const price = 0.0;
    }

    window.analytics.track(eventName, {
      properties: {
        name: repo.full_github_name,
        revenue: price
      }
    });
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
          ?
            <ReposSyncSpinner/>
          :
            <OrganizationsList
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
