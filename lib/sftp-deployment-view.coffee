{View} = require 'atom'

module.exports =
class SftpDeploymentView extends View
  @content: ->
    @div class: 'sftp-deployment overlay from-top', =>
      @div "The SftpDeployment package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "sftp-deployment:sendsingle", => @sendsingle()
    atom.workspaceView.command "sftp-deployment:maptoremote", => @maptoremote()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  toggle: ->
    console.log "SftpDeploymentView was toggled!"
    if @hasParent()
      @detach()
    else
      atom.workspaceView.append(this)

  sendsingle: ->
    console.log 'send single'

    fs = require 'fs'
    path = require 'path'

    fs.readFile(path.join(atom.project.path, "sftp-config.json"), 'utf8', (err, data) ->
      throw err if err

      config = JSON.parse(data)

      Connection = require 'ssh2'
      c = new Connection();
      c.on('ready', ->
        console.log 'Connection :: ready'

        c.sftp((err, sftp) ->
          throw err if err

          sftp.on('end', ->
            console.log 'SFTP :: SFTP session closed'
          )

          sftp.fastPut(path.join(atom.project.path, "sftp-config.json"), 'sftp-config.json', (err) ->
            throw err if err
            console.log 'SFTP :: Fast put'
            sftp.end()
          )
        )
      )

      c.on('error', (err) ->
        console.log 'Connection :: error :: ' + err
      )

      c.on('end', ->
        console.log 'Connection :: end'
      )

      c.on('close', (had_error) ->
        console.log 'Connection :: close'
      )

      c.connect(config)
    )

  maptoremote: ->
    console.log 'map to remote'
    fs = require 'fs'
    path = require 'path'
    config = {
      host: "your_host",
      username: "your_user",
      password: "your_pass",
      port: "your_port"
    };
    fs.writeFile(path.join(atom.project.path, "sftp-config.json"), JSON.stringify(config));
