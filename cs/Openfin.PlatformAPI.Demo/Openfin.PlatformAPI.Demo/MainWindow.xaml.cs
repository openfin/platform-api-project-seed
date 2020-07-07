using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Openfin.Desktop;
using Openfin.Desktop.PlatformAPI;
using Openfin.Desktop.PlatformAPI.Layout;
using Openfin.Desktop.PlatformAPI.View;
using OpenfinDesktop.PlatformAPI.EventArguments.Window;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using WK.Libraries.SharpClipboardNS;

namespace Openfin.PlatformAPI.Demo
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        private SharpClipboard clipboardMonitor = new SharpClipboard();
        private string currentClipboardContents;
        private LayoutGenerator layoutGeneratorScreen;
        private ObservableCollection<Platform> platforms = new ObservableCollection<Platform>();
        private Dictionary<string, ObservableCollection<PlatformView>> platformViews = new Dictionary<string, ObservableCollection<PlatformView>>();
        private ObservableCollection<Desktop.Window> platformWindows = new ObservableCollection<Desktop.Window>();
        private Runtime runtime;
        private ObservableCollection<SavedLayout> savedLayouts = new ObservableCollection<SavedLayout>();
        private ObservableCollection<SavedSnapshot> savedSnapshots = new ObservableCollection<SavedSnapshot>();
        private Platform selectedPlatform;

        public MainWindow()
        {
            InitializeComponent();

            clipboardMonitor.ObserveLastEntry = false;
            clipboardMonitor.ClipboardChanged += ClipboardMonitor_ClipboardChanged;

            dgSavedLayouts.DataContext = savedLayouts;
            dgRunningPlatforms.DataContext = platforms;
            dgPlatformWindows.DataContext = platformWindows;
            dgSavedSnapshots.DataContext = savedSnapshots;

            dgRunningPlatforms.SelectionChanged += DgRunningPlatforms_SelectionChanged;

               var runtimeOptions = new RuntimeOptions
               {
                   Version = "canary",
                   Arguments = "--v=1 --inspect"
               };

            runtime = Runtime.GetRuntimeInstance(runtimeOptions);
            runtime.Connect(() =>
            {
                Dispatcher.Invoke(() =>
                {
                    tbRuntimeStatus.Text = "Connected!";
                    tbRuntimeVersion.Text = runtimeOptions.Version;
                    tbFrameworkVersion.Text = Environment.Version.ToString();
                    btnStartPlatform.IsEnabled = true;
                });
            });

            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
        }

        private void btnApplyPreset_Click(object sender, RoutedEventArgs e)
        {
            dlgLayoutPreset.IsOpen = true;
        }

        private async void btnApplySnapshot_Click(object sender, RoutedEventArgs e)
        {
            var snapshot = (SavedSnapshot)dgSavedSnapshots.SelectedItem;

            if (snapshot == null)
            {
                MessageBox.Show("Select a snapshot to apply.");
                return;
            }

            await selectedPlatform.ApplySnapshotAsync(snapshot.Snapshot, new ApplySnapshotOptions { CloseExistingWindows = snapshot.ClosePlatformWhenApplying });
        }

        private void btnCancelCreatePlatformView_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateView.IsOpen = false;
        }

        private void btnCancelCreatePlatformWindow_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateWindow.IsOpen = false;
        }

        private void btnCancelSaveLayout_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveLayout.IsOpen = false;
        }

        private void btnCancelSaveSnapshot_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveSnapshot.IsOpen = false;
        }

        private async void btnCloseView_Click(object sender, RoutedEventArgs e)
        {
            var view = (PlatformView)dgPlatformViews.SelectedItem;

            if (view == null)
            {
                MessageBox.Show("Select a view to close.");
                return;
            }

            await selectedPlatform.CloseViewAsync(view.Identity);
        }

        private void btnCloseWindow_Click(object sender, RoutedEventArgs e)
        {
            var window = (Desktop.Window)dgPlatformWindows.SelectedItem;

            if (window == null)
            {
                MessageBox.Show("Choose a window to close.");
                return;
            }

            window.close();
        }

        private void btnCreateOFWindow_Click(object sender, RoutedEventArgs e)
        {
        }

        private async void btnCreatePlatformView_Click(object sender, RoutedEventArgs e)
        {
            if (platforms.Count == 0)
            {
                MessageBox.Show("Start the platform first.");
                return;
            }

            if (string.IsNullOrEmpty(tbViewUrl.Text))
            {
                tbViewUrl.Text = "https://openfin.co";
            }
            else
            {
                Uri uriResult;
                var validUrl = Uri.TryCreate(tbViewUrl.Text, UriKind.Absolute, out uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

                if (!validUrl)
                {
                    MessageBox.Show("Enter a valid URL.");
                    return;
                }
            }           
            
            Identity targetIdentity = ((Desktop.Window)dgPlatformWindows.SelectedItem)?.Identity;

            var options = new ViewCreationOptions
            {
                Url = tbViewUrl.Text,
                Name = string.IsNullOrEmpty(tbViewName.Text) ? Guid.NewGuid().ToString() : tbViewName.Text,
                BackgroundColor = getSystemDrawingColor(cpViewBackground.Color)
            };

            var view = await selectedPlatform.CreateViewAsync(options, targetIdentity);

            view.ViewDestroyed += (s, e) =>
            {
                Dispatcher.Invoke(() =>
                {
                    var views = platformViews[targetIdentity.Name];
                    views.Remove(e.View);
                });
            };

            if (targetIdentity == null)
            {
                targetIdentity = view.ParentWindowIdentity;
                var window = runtime.WrapApplication(selectedPlatform.UUID).WrapWindow(view.ParentWindowIdentity.Name);
                window.Closed += Window_Closed;
                platformWindows.Add(window);
            }

            if (!platformViews.ContainsKey(targetIdentity.Name))
            {
                platformViews[targetIdentity.Name] = new ObservableCollection<PlatformView>();
            }

            platformViews[targetIdentity.Name].Add(view);
            dgPlatformViews.ItemsSource = platformViews[targetIdentity.Name];

            dlgCreateView.IsOpen = false;
        }

        private async void btnCreatePlatformWindow_Click(object sender, RoutedEventArgs e)
        {
            if (platforms.Count == 0)
            {
                await startPlatform();
            }

            var options = new PlatformWindowOptions(Guid.NewGuid().ToString())
            {
                BackgroundColor = getSystemDrawingColor(cpWindowBackground.Color),
                Frame = cbCreateFrame.IsChecked.Value,
                Resizable = cbResizable.IsChecked.Value,
                Minimizable = cbMinimizable.IsChecked.Value,
                Maximizable = cbMaximizable.IsChecked.Value,
                Opacity = slOpacity.Value,
                DefaultCentered = cbCreatePlatformWindowDefaultCentered.IsChecked.Value
            };

            // This code is for this demo purposes only.
            // Window layouts should be created with the layout generator tool which can be found at https://openfin.github.io/golden-prototype/config-gen
            var snapshotJson = await File.ReadAllTextAsync(Environment.CurrentDirectory + "\\snapshot.json");

            snapshotJson = snapshotJson
                .Replace("%name%", Guid.NewGuid().ToString());

            options.Layout = JsonConvert
               .DeserializeObject<Snapshot>(snapshotJson)
               .Windows
               .First()
               .Layout;

            var window = await selectedPlatform.CreateWindowAsync(options);
                      

            window.Closed += Window_Closed;
            window.ViewAttached += Window_ViewAttached;
            
            platformWindows.Add(window);           
        }

        private async void Window_ViewAttached(object sender, OpenfinDesktop.PlatformAPI.EventArguments.Window.PlatformViewAttachedArgs e)
        {
            var window = e.Window;

            if (!platformViews.ContainsKey(window.Name))
            {
                platformViews[window.Name] = new ObservableCollection<PlatformView>();
            }

            var views = new List<PlatformView>();

            while (views.Count == 0)
            {
                views = await window.GetViewsAsync() as List<PlatformView>;

                foreach (var view in views)
                {
                    Dispatcher.Invoke(() =>
                    {
                        platformViews[window.Name].Add(view);
                    });
                    
                }
            }

            Dispatcher.Invoke(() =>
            {
                dlgCreateWindow.IsOpen = false;
            });            
        }

        private void btnCreateView_Click(object sender, RoutedEventArgs e)
        {
            tbTargetWindow.Text = ((Desktop.Window)dgPlatformWindows.SelectedItem)?.Name ?? "(one will be generated)";
            dlgCreateView.IsOpen = true;
        }

        private void btnCreateWindow_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateWindow.IsOpen = true;
        }

        private void btnLaunchGenerator_Click(object sender, RoutedEventArgs e)
        {
            layoutGeneratorScreen = new LayoutGenerator();
            layoutGeneratorScreen.ShowDialog();
        }

        private void setButtonEnabled(Button button, bool isEnabled)
        {
            Dispatcher.Invoke(() =>
            {
                button.IsEnabled = isEnabled;
            });
        }

        private async void btnPersistSnapshot_Click(object sender, RoutedEventArgs e)
        {
            var snapshotName = tbSnapshotName.Text;

            if (savedSnapshots.Any(x => x.SnapshotName.ToLower() == snapshotName.ToLower()))
            {
                MessageBox.Show("Pick a unique name.");
                return;
            }

            var snapshot = await selectedPlatform.GetSnapshotAsync();

            var savedSnapshot = new SavedSnapshot
            {
                Snapshot = snapshot,
                SnapshotName = snapshotName,
                ClosePlatformWhenApplying = cbClosePlatform.IsChecked.Value
            };

            savedSnapshots.Add(savedSnapshot);
            dlgSaveSnapshot.IsOpen = false;
        }

        private async void btnPresetsApply_Click(object sender, RoutedEventArgs e)
        {
            PresetLayoutOptions preset = new PresetLayoutOptions();

            if (rbPresetColumns.IsChecked.Value)
            {
                preset.PresetType = PlatformLayoutPresetTypes.Columns;
            }
            else if (rbPresetColumns.IsChecked.Value)
            {
                preset.PresetType = PlatformLayoutPresetTypes.Grid;
            }
            else if (rbPresetColumns.IsChecked.Value)
            {
                preset.PresetType = PlatformLayoutPresetTypes.Rows;
            }
            else
                preset.PresetType = PlatformLayoutPresetTypes.Tabs;

            var targetWindow = dgPlatformWindows.SelectedItem as Desktop.Window;

            var layout = new PlatformLayout(targetWindow.Identity, selectedPlatform);

            await layout.ApplyPresetAsync(preset);

            dlgLayoutPreset.IsOpen = false;
        }

        private void btnPresetsCancel_Click(object sender, RoutedEventArgs e)
        {
            dlgLayoutPreset.IsOpen = false;
        }

        private void btnQuitPlatform_Click(object sender, RoutedEventArgs e)
        {
            selectedPlatform.QuitPlatformAsync();
            platforms.Clear();

            setButtonEnabled(btnQuitPlatform, false);
            setButtonEnabled(btnStartPlatform, true);
        } 

        private async void btnReplaceLayout_Click(object sender, RoutedEventArgs e)
        {
            var targetWindow = dgPlatformWindows.SelectedItem as Desktop.Window;
          
            if (targetWindow == null)
            {
                MessageBox.Show("Select a platform window from Window Management.");
                return;
            }

            targetWindow.PlatformLayoutReady += TargetWindow_PlatformLayoutReady;

            if (dgSavedLayouts.SelectedItem == null)
            {
                MessageBox.Show("Select a layout.");
                return;
            }

            var savedLayout = dgSavedLayouts.SelectedItem as SavedLayout;

            PlatformLayout layout = new PlatformLayout(targetWindow.Identity, selectedPlatform);

            try
            {
                var jobj = JObject.Parse(savedLayout.LayoutConfig);
                var layoutConfiguration = ((JArray)jobj["snapshot"]["windows"])[0]["layout"].ToObject<PlatformLayoutConfiguration>();
                await layout.ReplaceLayoutAsync(layoutConfiguration);
            }
            catch(Exception ex)
            {
                MessageBox.Show(savedLayout.LayoutConfig, "An error occurred parsing the JSON");
                return;
            }
        }

        private async void TargetWindow_PlatformLayoutReady(object sender, PlatformLayoutReadyEventArgs e)
        {
            MessageBox.Show("entered ready handler");

            var targetWindow = e.Window;
            var views = await targetWindow.GetViewsAsync();

            platformViews[targetWindow.Name] = new ObservableCollection<PlatformView>();

            foreach (var view in views)
            {
                Dispatcher.Invoke(() =>
                {
                    platformViews[targetWindow.Name].Add(view);
                });
            }

            Dispatcher.Invoke(() =>
            {
                dgPlatformViews.ItemsSource = platformViews[targetWindow.Name];
            });

            targetWindow.PlatformLayoutReady -= TargetWindow_PlatformLayoutReady;
        }

        private void btnSaveLayout_Click(object sender, RoutedEventArgs e)
        {
            if (savedLayouts.Any(x => x.LayoutName == tbLayoutName.Text))
            {
                MessageBox.Show("Pick a unique name.");
                return;
            }

            savedLayouts.Add(new SavedLayout { LayoutName = tbLayoutName.Text, LayoutConfig = currentClipboardContents });
            dlgSaveLayout.IsOpen = false;
        }

        private void btnSaveSnapshot_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveSnapshot.IsOpen = true;
        }

        private async void btnStartPlatform_Click(object sender, RoutedEventArgs e)
        {
            setButtonEnabled(btnStartPlatform, false);
            await startPlatform();
            setButtonEnabled(btnQuitPlatform, true);
        }

        private void ClipboardMonitor_ClipboardChanged(object sender, SharpClipboard.ClipboardChangedEventArgs e)
        {            
            if (e.SourceApplication.Name == "Openfin.PlatformAPI.Demo.exe" && e.ContentType == SharpClipboard.ContentTypes.Text)
            {
                try
                {
                    currentClipboardContents = e.Content.ToString();

                    if(string.IsNullOrEmpty(currentClipboardContents))
                    {
                        MessageBox.Show("An error occurred getting clipboard contents");
                        return;
                    }

                    JsonConvert.DeserializeObject<PlatformOptions>(currentClipboardContents);
                    layoutGeneratorScreen?.Close();
                    dlgSaveLayout.IsOpen = true;
                }
                catch (Exception)
                {                    
                }
            }
        }

        private void cpViewBackground_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            Dispatcher.Invoke(() =>
            {
                tbSelectedViewBackgroundColorHex.Text = ColorTranslator.ToHtml(getSystemDrawingColor(cpViewBackground.Color));
                rectSelectedViewColor.Fill = new SolidColorBrush(cpViewBackground.Color);
            });
        }

        private void cpWindowBackground_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            Dispatcher.Invoke(() =>
            {
                tbSelectedWindowBackgroundColorHex.Text = ColorTranslator.ToHtml(getSystemDrawingColor(cpWindowBackground.Color));
                rectSelectedWindowColor.Fill = new SolidColorBrush(cpWindowBackground.Color);
            });
        }

        private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            MessageBox.Show(e.ExceptionObject.ToString());
        }

        private void dgPlatformWindows_CurrentCellChanged(object sender, EventArgs e)
        {
        }

        private void dgPlatformWindows_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var selectedWindow = (Desktop.Window)dgPlatformWindows.SelectedItem;

            if (selectedWindow != null)
            {
                var key = selectedWindow.Name;

                if (!platformViews.ContainsKey(key))
                {
                    platformViews[key] = new ObservableCollection<PlatformView>();
                }

                dgPlatformViews.ItemsSource = platformViews[key];
            }
        }

        private void DgRunningPlatforms_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            selectedPlatform = (Platform)dgRunningPlatforms.SelectedItem;
        }

        private System.Drawing.Color getSystemDrawingColor(System.Windows.Media.Color color)
        {
            return System.Drawing.Color.FromArgb(color.A, color.R, color.G, color.B);
        }

        private void lnkViewManagement_Click(object sender, RoutedEventArgs e)
        {
            tiViewManagement.IsSelected = true;
        }

        private async Task startPlatform()
        {
            var platform = await PlatformService.StartPlatformAsync("https://raw.githubusercontent.com/openfin/platform-api-project-seed/master/public.json", runtime);

            foreach (var window in platform.PlatformWindows)
            {
                window.Key.Closed += Window_Closed;
                platformWindows.Add(window.Key);

                var observableViews = new ObservableCollection<PlatformView>();

                foreach (var view in window.Value)
                {
                    observableViews.Add(view);
                }

                platformViews.Add(window.Key.Name, observableViews);
            }

            selectedPlatform = platform;
            platforms.Add(platform);
        }

        private void Window_Closed(object sender, WindowEventArgs e)
        {
            if (platformWindows.Count > 0)
            {
                var w = platformWindows.First(x => x.Name == e.Window.Name);

                Dispatcher.Invoke(() =>
                {
                    platformViews.Remove(w.Name);
                    platformWindows.Remove(w);
                    dgPlatformViews.ItemsSource = new ObservableCollection<PlatformView>();
                });
            }
        }
    }
}
