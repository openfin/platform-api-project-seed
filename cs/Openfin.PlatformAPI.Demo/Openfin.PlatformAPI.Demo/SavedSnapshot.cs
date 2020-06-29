using Openfin.Desktop.PlatformAPI;

namespace Openfin.PlatformAPI.Demo
{
    public class SavedSnapshot
    {
        public string SnapshotName { get; set; }
        public Snapshot Snapshot { get; set; }
        public bool ClosePlatformWhenApplying { get; set; }
    }
}