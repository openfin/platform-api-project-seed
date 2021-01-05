using Openfin.Desktop;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Openfin.PlatformAPI.Demo
{
    /// <summary>
    /// Interaction logic for LayoutGenerator.xaml
    /// </summary>
    public partial class LayoutGenerator 
    {
        public LayoutGenerator()
        {
            InitializeComponent();

            var runtimeOptions = new RuntimeOptions
            {
                Version = "canary"                
            };

            
            var appOptions = new ApplicationOptions(Guid.NewGuid().ToString(), Guid.NewGuid().ToString(), "https://openfin.github.io/golden-prototype/config-gen");
            appOptions.MainWindowOptions.PreloadScripts = new List<PreloadScript>();
            appOptions.MainWindowOptions.PreloadScripts.Add(new PreloadScript("preloadscript.js", false));
            embeddedView.Initialize(runtimeOptions, appOptions);
        }
    }
}
