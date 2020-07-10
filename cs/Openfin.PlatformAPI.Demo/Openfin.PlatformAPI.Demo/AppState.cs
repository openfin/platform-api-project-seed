using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Openfin.PlatformAPI.Demo
{
    public class AppState
    {
        public ObservableCollection<SavedLayout> Layouts { get; set; }
        public ObservableCollection<SavedSnapshot> Snapshots { get; set; }
    }
}
