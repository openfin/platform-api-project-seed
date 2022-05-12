public static async Task Init(Runtime runtime, Application app, string environment)
{
	ActiveEnvironment = environment;

	commsReceiver = runtime.InterApplicationBus.Channel.CreateProvider(string.Format(CHANNEL_FORMAT, CHANNEL_NAME, ActiveEnvironment));

	commsReceiver.RegisterTopic<WindowState>(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WINDOW_CONNECT, ActiveEnvironment),
		windowState =>
		{
			WindowManager.MonitorWindow(windowState);

			// Necessary until all applications are upgraded past client-openfin v20.2.0
			Task.Run(async () =>
			{
				await Task.Delay(200);
				CoreClient?.DispatchAsync(
					string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, POC_POST_WINDOW, ActiveEnvironment),
					windowState);
			});
		});

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WINDOWS_BRING_TO_FRONT, ActiveEnvironment),
		() => WindowManager.BringToFront());

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WINDOWS_MINIMIZE, ActiveEnvironment),
		WindowManager.MinimizeAll);

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WINDOWS_RESTORE, ActiveEnvironment),
		WindowManager.RestoreAll);

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WORKSPACE_SAVE, ActiveEnvironment),
		() => { WorkspaceManager.GenerateWorkspaceSnapshot(app); }); // Do Not Return

	commsReceiver.RegisterTopic<Snapshot>(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WORKSPACE_RESTORE, ActiveEnvironment),
		snapshot => { WorkspaceManager.RestoreWorkspaceSnapshot(app, snapshot); });

	commsReceiver.RegisterTopic<Snapshot>(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WORKSPACE_REPLACE, ActiveEnvironment),
		snapshot => { WorkspaceManager.ReplaceWorkspaceSnapshot(app, snapshot); });

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, WINDOWS_GATHER, ActiveEnvironment),
		WindowManager.GatherWindows);

	commsReceiver.RegisterTopic<SendLogsInfoData>(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, SEND_LOGS, ActiveEnvironment),
		MailManager.SendLogs);

	// Necessary until all applications are upgraded past client-openfin v20.2.0
	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, CORE_CONNECTION, ActiveEnvironment),
		OnCoreConnected);

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, TRADESMART_GET, ActiveEnvironment),
		FileSystem.GetTradeSmartPath);

	commsReceiver.RegisterTopic(
		string.Format(CHANNEL_ACTION_FORMAT, CHANNEL_NAME, TSFX_GET, ActiveEnvironment),
		FileSystem.GetTSFXPath);

	commsReceiver.ClientConnected += OnClientConnected;
	commsReceiver.Opened += CommsReceiver_Opened;
	commsReceiver.Closed += CommsReceiver_Closed;

	await commsReceiver.OpenAsync();
}
