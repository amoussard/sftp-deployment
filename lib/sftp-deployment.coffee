SftpDeploymentView = require './sftp-deployment-view'

module.exports =
  sftpDeploymentView: null

  activate: (state) ->
    @sftpDeploymentView = new SftpDeploymentView(state.sftpDeploymentViewState)

  deactivate: ->
    @sftpDeploymentView.destroy()

  serialize: ->
    sftpDeploymentViewState: @sftpDeploymentView.serialize()
