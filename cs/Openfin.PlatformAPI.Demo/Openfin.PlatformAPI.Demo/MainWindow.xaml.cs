using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Openfin.Desktop;
using Openfin.Desktop.PlatformAPI;
using Openfin.Desktop.PlatformAPI.Layout;
using Openfin.Desktop.PlatformAPI.View;
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
        private LayoutGenerator layoutGeneratorScreen;
        private Runtime runtime;
        private Platform selectedPlatform;

        private ObservableCollection<SavedLayout> savedLayouts = new ObservableCollection<SavedLayout>();
        private ObservableCollection<Platform> platforms = new ObservableCollection<Platform>();
        private Dictionary<string, ObservableCollection<PlatformView>> platformViews = new Dictionary<string, ObservableCollection<PlatformView>>();
        private ObservableCollection<Desktop.Window> platformWindows = new ObservableCollection<Desktop.Window>();
        private ObservableCollection<SavedSnapshot> savedSnapshots = new ObservableCollection<SavedSnapshot>();

        public MainWindow()
        {
            InitializeComponent();

            clipboardMonitor.ObserveLastEntry = false;
            clipboardMonitor.ClipboardChanged += ClipboardMonitor_ClipboardChanged;

            dgSavedLayouts.DataContext = savedLayouts;
            dgRunningPlatforms.DataContext = platforms;
            dgPlatformWindows.DataContext = platformWindows;
            dgSavedSnapshots.DataContext = savedSnapshots;

            dgRunningPlatforms.SelectionChanged += DgRunningPlatforms_SelectionChanged; ;

            var runtimeOptions = new RuntimeOptions
            {
                Version = "canary"
            };

            runtime = Runtime.GetRuntimeInstance(runtimeOptions);
            runtime.Connect(() =>
            {
                Dispatcher.Invoke(() =>
                {
                    tbRuntimeStatus.Text = "Connected!";
                    tbRuntimeVersion.Text = runtimeOptions.Version;
                    tbFrameworkVersion.Text = Environment.Version.ToString();
                });
            });

            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
        }

        private void DgRunningPlatforms_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            selectedPlatform = (Platform)dgRunningPlatforms.SelectedItem;         
        }

        private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            MessageBox.Show(e.ExceptionObject.ToString());
        }

        private string currentClipboardContents;

        private void ClipboardMonitor_ClipboardChanged(object sender, SharpClipboard.ClipboardChangedEventArgs e)
        {
            if (e.SourceApplication.Name == "Openfin.PlatformAPI.Demo.exe" && e.ContentType == SharpClipboard.ContentTypes.Text)
            {
                try
                {
                    currentClipboardContents = e.Content.ToString();
                    JsonConvert.DeserializeObject<PlatformOptions>(currentClipboardContents);
                    layoutGeneratorScreen?.Close();
                    dlgSaveLayout.IsOpen = true;
                }
                catch (Exception)
                {
                }
            }
        }

        private async void btnStartPlatform_Click(object sender, RoutedEventArgs e)
        {
            await startPlatform();
            Dispatcher.Invoke(() => { btnStartPlatform.IsEnabled = false; btnQuitPlatform.IsEnabled = true; });
        }

        private async Task startPlatform()
        {
            var platform = await PlatformService.StartPlatformAsync("https://raw.githubusercontent.com/openfin/platform-api-project-seed/master/public.json", runtime);
            platforms.Add(platform);
            selectedPlatform = platform;
        }

        private void btnLaunchGenerator_Click(object sender, RoutedEventArgs e)
        {
            layoutGeneratorScreen = new LayoutGenerator();
            layoutGeneratorScreen.Show();
        }

        private void btnCancelSaveLayout_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveLayout.IsOpen = false;
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

        private async void btnReplaceLayout_Click(object sender, RoutedEventArgs e)
        {
            var targetWindow = dgPlatformWindows.SelectedItem as Desktop.Window;

            if (targetWindow == null)
            {
                MessageBox.Show("Select a platform window from Window Management.");
                return;
            }

            PlatformLayout layout = new PlatformLayout(targetWindow.Identity, selectedPlatform);
            var savedLayout = dgSavedLayouts.SelectedItem as SavedLayout;
            var jobj = JObject.Parse(savedLayout.LayoutConfig);

            var layoutConfiguration = ((JArray)jobj["snapshot"]["windows"])[0]["layout"].ToObject<PlatformLayoutConfiguration>();

            await layout.ReplaceLayoutAsync(layoutConfiguration);

            MessageBox.Show($"Layout for window {targetWindow.Name} replaced successfully.");
        }

        private void btnApplyPreset_Click(object sender, RoutedEventArgs e)
        {
            dlgLayoutPreset.IsOpen = true;
        }

        private void btnQuitPlatform_Click(object sender, RoutedEventArgs e)
        {
            selectedPlatform.QuitPlatformAsync();
            platforms.Clear();

            Dispatcher.Invoke(() => { btnQuitPlatform.IsEnabled = false; btnStartPlatform.IsEnabled = true; });
        }

        private void btnCreateWindow_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateWindow.IsOpen = true;
        }

        private void btnCreateOFWindow_Click(object sender, RoutedEventArgs e)
        {
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

            platformWindows.Add(window);

            dlgCreateWindow.IsOpen = false;
        }

        private System.Drawing.Color getSystemDrawingColor(System.Windows.Media.Color color)
        {
            return System.Drawing.Color.FromArgb(color.A, color.R, color.G, color.B);
        }

        private void btnCancelCreatePlatformWindow_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateWindow.IsOpen = false;
        }

        private void btnCreateView_Click(object sender, RoutedEventArgs e)
        {
            tbTargetWindow.Text = ((Desktop.Window)dgPlatformWindows.SelectedItem)?.Name ?? "(one will be generated)";
            dlgCreateView.IsOpen = true;
        }

        private void Window_Closed(object sender, WindowEventArgs e)
        {
            if (platformWindows.Count > 0)
            {
                var w = platformWindows.First(x => x.Name == e.Window.Name);

                Dispatcher.Invoke(() =>
                {
                    platformWindows.Remove(w);
                });
            }
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

        private void btnSaveSnapshot_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveSnapshot.IsOpen = true;
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

        private void btnCancelSaveSnapshot_Click(object sender, RoutedEventArgs e)
        {
            dlgSaveSnapshot.IsOpen = false;
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

        private void btnCloseView_Click(object sender, RoutedEventArgs e)
        {
            var view = (PlatformView)dgPlatformViews.SelectedItem;

            if (view == null)
            {
                MessageBox.Show("Select a view to close.");
                return;
            }

            selectedPlatform.CloseViewAsync(view.Identity);
        }

        private void btnCancelCreatePlatformView_Click(object sender, RoutedEventArgs e)
        {
            dlgCreateView.IsOpen = false;
        }

        private async void btnCreatePlatformView_Click(object sender, RoutedEventArgs e)
        {
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

            if (platforms.Count == 0)
            {
                await startPlatform();
            }

            var platform = selectedPlatform;
            Identity targetIdentity = ((Desktop.Window)dgPlatformWindows.SelectedItem)?.Identity;

            var options = new ViewCreationOptions
            {
                Url = tbViewUrl.Text,
                Name = string.IsNullOrEmpty(tbViewName.Text) ? Guid.NewGuid().ToString() : tbViewName.Text,
                BackgroundColor = getSystemDrawingColor(cpViewBackground.Color)
            };

            var view = await platform.CreateViewAsync(options, targetIdentity);

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
                var window = runtime.WrapApplication(platform.UUID).WrapWindow(view.ParentWindowIdentity.Name);
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

        private void lnkViewManagement_Click(object sender, RoutedEventArgs e)
        {
            tiViewManagement.IsSelected = true;
        }

        private void btnPresetsCancel_Click(object sender, RoutedEventArgs e)
        {
            dlgLayoutPreset.IsOpen = false;
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
    }
}