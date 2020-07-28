using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace Openfin.PlatformAPI.Demo
{
    
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        Mutex mutex;

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            bool isNewInstance = false;

            mutex = new Mutex(true, "Openfin.PlatformAPI.Demo", out isNewInstance);

            if(!isNewInstance)
            {
                App.Current.Shutdown();
            }
        }
    }
}
