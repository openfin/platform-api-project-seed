try
{
	await Communication.Init(runtime, app, environment);
	Logger.WriteLine("Communications Inited. ");
}
catch (AggregateException ae)
{
	ae.Handle(ex =>
	{
		Logger.WriteLine($"Communications Failed to initialize: {ex.Message}");
		return true;
	});
	Close();
}
catch (Exception ex)
{
	Logger.WriteLine($"Communications Failed to initialize: {ex.Message}");
	Close();
}