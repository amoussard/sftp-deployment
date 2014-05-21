{WorkspaceView} = require 'atom'
SftpDeployment = require '../lib/sftp-deployment'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "SftpDeployment", ->
  activationPromise = null

  beforeEach ->
    atom.workspaceView = new WorkspaceView
    activationPromise = atom.packages.activatePackage('sftp-deployment')

  describe "when the sftp-deployment:toggle event is triggered", ->
    it "attaches and then detaches the view", ->
      expect(atom.workspaceView.find('.sftp-deployment')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.workspaceView.trigger 'sftp-deployment:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(atom.workspaceView.find('.sftp-deployment')).toExist()
        atom.workspaceView.trigger 'sftp-deployment:toggle'
        expect(atom.workspaceView.find('.sftp-deployment')).not.toExist()
