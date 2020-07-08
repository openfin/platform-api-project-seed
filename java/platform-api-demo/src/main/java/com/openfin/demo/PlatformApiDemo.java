package com.openfin.demo;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextField;
import javax.swing.JTree;
import javax.swing.ListCellRenderer;
import javax.swing.ListSelectionModel;
import javax.swing.SwingUtilities;
import javax.swing.event.TreeSelectionEvent;
import javax.swing.event.TreeSelectionListener;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.TreePath;
import javax.swing.tree.TreeSelectionModel;

import org.json.JSONObject;

import com.openfin.desktop.Application;
import com.openfin.desktop.DesktopConnection;
import com.openfin.desktop.DesktopException;
import com.openfin.desktop.DesktopIOException;
import com.openfin.desktop.DesktopStateListener;
import com.openfin.desktop.Identity;
import com.openfin.desktop.Layout;
import com.openfin.desktop.LayoutContentItemOptions;
import com.openfin.desktop.LayoutContentItemStateOptions;
import com.openfin.desktop.LayoutContentOptionsImpl;
import com.openfin.desktop.LayoutOptions;
import com.openfin.desktop.OpenFinRuntime;
import com.openfin.desktop.RuntimeConfiguration;
import com.openfin.desktop.Window;
import com.openfin.desktop.WindowOptions;
import com.openfin.desktop.platform.Platform;
import com.openfin.desktop.platform.PlatformOptions;
import com.openfin.desktop.platform.PlatformViewOptions;
import com.openfin.desktop.platform.PlatformWindowOptions;
import com.sun.corba.se.impl.orbutil.graph.Node;

public class PlatformApiDemo {

	private JFrame frame;
	private DesktopConnection desktopConnection;
	private JPanel glassPane;
	private DefaultTreeModel platformTreeModel;
	private DefaultMutableTreeNode rootNode;
	private JTree runtimeTree;

	PlatformApiDemo() {
		try {
			this.createGui();
			this.launchOpenFin();
		}
		catch (DesktopIOException | IOException | DesktopException e) {
			e.printStackTrace();
		}
	}

	JPanel createGlassPane() {
		JPanel p = new JPanel(new BorderLayout());
		p.add(new JLabel("Loading, please wait......", JLabel.CENTER), BorderLayout.CENTER);
		return p;
	}

	JPanel createRuntimeTreePanel() {
		JPanel p = new JPanel(new BorderLayout());
		p.setBorder(BorderFactory.createTitledBorder("Running Platforms"));
		this.rootNode = new DefaultMutableTreeNode("OpenFin Runtime");
		this.platformTreeModel = new DefaultTreeModel(this.rootNode);
		this.runtimeTree = new JTree(this.platformTreeModel);
		this.runtimeTree.setShowsRootHandles(true);
		JLabel renderer = new JLabel();
		renderer.setOpaque(true);
		this.runtimeTree.setCellRenderer((t, value, selected, expanded, leaf, row, hasFocus) -> {
			DefaultMutableTreeNode node = (DefaultMutableTreeNode) value;
			Object nodeValue = node.getUserObject();
			if (nodeValue instanceof Platform) {
				Platform platform = (Platform) nodeValue;
				renderer.setText(platform.getUuid());
			}
			else if (nodeValue instanceof Window) {
				Window window = (Window) nodeValue;
				renderer.setText(window.getName());
			}
			else {
				renderer.setText(value.toString());
			}
			renderer.setBackground(selected ? Color.LIGHT_GRAY : Color.WHITE);
			return renderer;
		});

		this.runtimeTree.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent me) {
				if (me.getClickCount() == 2) {
					TreePath path = runtimeTree.getPathForLocation(me.getX(), me.getY());
					Object nodeValue = ((DefaultMutableTreeNode) path.getLastPathComponent()).getUserObject();
					if (nodeValue instanceof Window) {
						Window window = (Window) nodeValue;
						try {
							window.bringToFront();
						}
						catch (DesktopException e) {
							e.printStackTrace();
						}
					}

				}
			}
		});

		p.add(new JScrollPane(this.runtimeTree), BorderLayout.CENTER);
		return p;
	}

	@SuppressWarnings("unchecked")
	<T> T getSelectedNode(Class<T> clazz) {
		T n = null;
		TreePath selectionPath = this.runtimeTree.getSelectionPath();
		if (selectionPath != null) {
			DefaultMutableTreeNode node = (DefaultMutableTreeNode) selectionPath.getLastPathComponent();
			if (clazz.isInstance(node.getUserObject())) {
				n = (T) node.getUserObject();
			}
		}
		return n;
	}

	JPanel createPlatformStartFromManifestPanel() {
		// JTextField tfUrl = new
		// JTextField("https://openfin.github.io/golden-prototype/public.json");
		JTextField tfUrl = new JTextField(
				"https://raw.githubusercontent.com/openfin/platform-api-project-seed/master/public.json");
		JButton btnStart = new JButton("Start");
		ActionListener al = ae -> {
			this.platformStartFromManifest(tfUrl.getText());
		};
		tfUrl.addActionListener(al);
		btnStart.addActionListener(al);
		JPanel p = new JPanel(new BorderLayout(5, 5));
		p.setBorder(BorderFactory.createTitledBorder("startFromManifest"));
		p.add(new JLabel("Manifest URL"), BorderLayout.WEST);
		p.add(tfUrl, BorderLayout.CENTER);
		p.add(btnStart, BorderLayout.EAST);
		return p;
	}

	JPanel createPlatformStartPanel() {
		JPanel p = new JPanel(new GridBagLayout());
		GridBagConstraints gbConst = new GridBagConstraints();
		gbConst.insets = new Insets(5, 5, 5, 5);
		gbConst.fill = GridBagConstraints.BOTH;
		gbConst.gridx = 0;
		gbConst.gridy = 0;
		p.setBorder(BorderFactory.createTitledBorder("start"));
		p.add(new JLabel("UUID"), gbConst);
		gbConst.gridy++;
		p.add(new JLabel("Default Window Width"), gbConst);
		gbConst.gridy++;
		p.add(new JLabel("Default Window Height"), gbConst);
		gbConst.gridy++;
		p.add(new JLabel("Default Window Centered"), gbConst);
		gbConst.weightx = 1;
		gbConst.gridwidth = 2;
		gbConst.gridx = 1;
		gbConst.gridy = 0;
		JTextField tfUuid = new JTextField(UUID.randomUUID().toString());
		p.add(tfUuid, gbConst);
		gbConst.gridy++;
		JTextField tfWinWidth = new JTextField("");
		p.add(tfWinWidth, gbConst);
		gbConst.gridy++;
		JTextField tfWinHeight = new JTextField("");
		p.add(tfWinHeight, gbConst);
		gbConst.gridy++;
		JCheckBox cbWinCenter = new JCheckBox("", false);
		p.add(cbWinCenter, gbConst);
		gbConst.gridwidth = 1;
		gbConst.gridy++;
		p.add(new JLabel(""), gbConst); // filler
		gbConst.gridx = 2;
		gbConst.weightx = 0;
		JButton btnStart = new JButton("Start");
		btnStart.addActionListener(e -> {
			platformStart(tfUuid.getText(), tfWinWidth.getText(), tfWinHeight.getText(), cbWinCenter.isSelected());
		});
		p.add(btnStart, gbConst);
		return p;
	}

	JPanel createPlatformPanel() {
		JPanel p = new JPanel();
		p.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
		p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
		p.add(createPlatformStartFromManifestPanel());
		p.add(createPlatformStartPanel());
		p.add(new Box.Filler(new Dimension(0, 0), new Dimension(0, Short.MAX_VALUE),
				new Dimension(0, Short.MAX_VALUE)));
		return p;
	}

	JPanel createWindowPanel() {
		JPanel pnl = new JPanel(new BorderLayout());
		JPanel pnlWinOpts = new JPanel(new GridBagLayout());
		pnlWinOpts.setBorder(BorderFactory.createTitledBorder("Window Options"));
		GridBagConstraints gbConst = new GridBagConstraints();
		gbConst.insets = new Insets(5, 5, 5, 5);
		gbConst.fill = GridBagConstraints.BOTH;
		gbConst.gridx = 0;
		gbConst.gridy = 0;
		JCheckBox cbInitLayout = new JCheckBox("Init Layout");
		pnlWinOpts.add(cbInitLayout, gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("Name"), gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("URL"), gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("Default Window Width"), gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("Default Window Height"), gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("Default Window Centered"), gbConst);
		gbConst.weightx = 1;
		gbConst.gridwidth = 2;
		gbConst.gridx = 1;
		gbConst.gridy = 1;
		JTextField tfName = new JTextField("windowName");
		pnlWinOpts.add(tfName, gbConst);
		gbConst.gridy++;
		JTextField tfUrl = new JTextField("https://openfin.co");
		pnlWinOpts.add(tfUrl, gbConst);
		gbConst.gridy++;
		JTextField tfWinWidth = new JTextField("");
		pnlWinOpts.add(tfWinWidth, gbConst);
		gbConst.gridy++;
		JTextField tfWinHeight = new JTextField("");
		pnlWinOpts.add(tfWinHeight, gbConst);
		gbConst.gridy++;
		JCheckBox cbWinCenter = new JCheckBox("", false);
		pnlWinOpts.add(cbWinCenter, gbConst);
		gbConst.gridwidth = 1;
		gbConst.gridy++;
		gbConst.weighty = 1;
		pnlWinOpts.add(new JLabel(""), gbConst); // filler

		JButton btnCreate = new JButton("Create");
		btnCreate.setEnabled(false);
		btnCreate.addActionListener(e -> {
			Platform platform = this.getSelectedNode(Platform.class);
			if (platform != null) {
				this.platformCreateWindow(platform, tfName.getText(), tfUrl.getText(), cbInitLayout.isSelected(),
						tfWinWidth.getText(), tfWinHeight.getText(), cbWinCenter.isSelected());
			}
			else {
				// show popup warning?
			}
		});

		JPanel pnlTop = new JPanel(new BorderLayout(5, 5));
		pnlTop.setBorder(BorderFactory.createEmptyBorder(20, 10, 20, 10));
		pnlTop.add(new JLabel("Selected Platform"), BorderLayout.WEST);
		JTextField tfSelectedPlatformUuid = new JTextField("N/A");
		tfSelectedPlatformUuid.setEditable(false);
		pnlTop.add(tfSelectedPlatformUuid, BorderLayout.CENTER);

		this.runtimeTree.addTreeSelectionListener(e -> {
			Platform p = this.getSelectedNode(Platform.class);
			btnCreate.setEnabled(p != null);
			tfSelectedPlatformUuid.setText(p == null ? "N/A" : p.getUuid());
		});

		JPanel pnlBottom = new JPanel(new FlowLayout(FlowLayout.RIGHT));
		pnlBottom.add(btnCreate);
		pnl.add(pnlTop, BorderLayout.NORTH);
		pnl.add(pnlWinOpts, BorderLayout.CENTER);
		pnl.add(pnlBottom, BorderLayout.SOUTH);
		return pnl;
	}

	JPanel createViewPanel() {
		JPanel pnl = new JPanel(new BorderLayout());
		JPanel pnlWinOpts = new JPanel(new GridBagLayout());
		pnlWinOpts.setBorder(BorderFactory.createTitledBorder("View Options"));
		GridBagConstraints gbConst = new GridBagConstraints();
		gbConst.insets = new Insets(5, 5, 5, 5);
		gbConst.fill = GridBagConstraints.BOTH;
		gbConst.gridx = 0;
		gbConst.gridy = 0;
		pnlWinOpts.add(new JLabel("Name"), gbConst);
		gbConst.gridy++;
		pnlWinOpts.add(new JLabel("URL"), gbConst);
		gbConst.weightx = 1;
		gbConst.gridwidth = 2;
		gbConst.gridx = 1;
		gbConst.gridy = 0;
		JTextField tfName = new JTextField("viewName");
		pnlWinOpts.add(tfName, gbConst);
		gbConst.gridy++;
		JTextField tfUrl = new JTextField("https://openfin.co");
		pnlWinOpts.add(tfUrl, gbConst);
		gbConst.gridwidth = 1;
		gbConst.gridy++;
		gbConst.weighty = 1;
		pnlWinOpts.add(new JLabel(""), gbConst); // filler

		JButton btnCreate = new JButton("Create");
		btnCreate.setEnabled(false);
		btnCreate.addActionListener(e -> {
			PlatformViewOptions viewOpts = new PlatformViewOptions();
			viewOpts.setName(tfName.getText());
			viewOpts.setUrl(tfUrl.getText());
			Platform p = this.getSelectedNode(Platform.class);
			Window w = this.getSelectedNode(Window.class);
			if (p != null) {
				this.platformCreateView(p, viewOpts, null);
				
			} else if (w != null) {
				p = (Platform) ((DefaultMutableTreeNode)this.runtimeTree.getSelectionPath().getParentPath().getLastPathComponent()).getUserObject();
				this.platformCreateView(p, viewOpts, w.getIdentity());
			}
		});
		JPanel pnlBottom = new JPanel(new FlowLayout(FlowLayout.RIGHT));
		pnlBottom.add(btnCreate);

		JPanel pnlTop = new JPanel(new BorderLayout(5, 5));
		pnlTop.setBorder(BorderFactory.createEmptyBorder(20, 10, 20, 10));
		pnlTop.add(new JLabel("Selected"), BorderLayout.WEST);
		JTextField tfSelectedWinIdentity = new JTextField("N/A");
		tfSelectedWinIdentity.setEditable(false);
		pnlTop.add(tfSelectedWinIdentity, BorderLayout.CENTER);

		this.runtimeTree.addTreeSelectionListener(e -> {
			Platform p = this.getSelectedNode(Platform.class);
			Window w = this.getSelectedNode(Window.class);
			btnCreate.setEnabled(p != null || w != null);
			if (p != null) {
				tfSelectedWinIdentity.setText("Platform: " + p.getUuid());
				
			} else if (w != null) {
				tfSelectedWinIdentity.setText("Window: " + w.getName());
			}
			else {
				tfSelectedWinIdentity.setText("N/A");
			}
		});

		pnl.add(pnlTop, BorderLayout.NORTH);
		pnl.add(pnlWinOpts, BorderLayout.CENTER);
		pnl.add(pnlBottom, BorderLayout.SOUTH);
		return pnl;
	}

	JPanel createSnapshotPanel() {
		JPanel p = new JPanel();
		p.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
		p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
		JPanel pnlSave = new JPanel();
		pnlSave.setLayout(new BoxLayout(pnlSave, BoxLayout.X_AXIS));
		pnlSave.setBorder(BorderFactory.createTitledBorder("Save Snapshot"));
		JTextField tfSavePath = new JTextField(new File("snapshot.json").getAbsolutePath().toString());
		tfSavePath.setPreferredSize(new Dimension(Short.MAX_VALUE, tfSavePath.getPreferredSize().height));
		JButton btnSave = new JButton("Save...");
		btnSave.addActionListener(e -> {
			Platform platform = this.getSelectedNode(Platform.class);
			if (platform != null) {
				JFileChooser fileChooser = new JFileChooser(new File(".").getAbsoluteFile());
				fileChooser.setSelectedFile(new File(tfSavePath.getText()));
				int rv = fileChooser.showSaveDialog(p);
				if (rv == JFileChooser.APPROVE_OPTION) {
					File saveFile = fileChooser.getSelectedFile();
					tfSavePath.setText(saveFile.getAbsolutePath());
					this.platformSaveSnapshot(platform, saveFile);
				}
			}
			else {
			}
		});
		pnlSave.add(tfSavePath);
		pnlSave.add(btnSave);

		JPanel pnlApply = new JPanel();
		pnlApply.setBorder(BorderFactory.createTitledBorder("Apply Snapshot"));
		pnlApply.setLayout(new BoxLayout(pnlApply, BoxLayout.X_AXIS));
		JTextField tfApplyPath = new JTextField(new File("snapshot.json").getAbsolutePath().toString());
		tfApplyPath.setPreferredSize(new Dimension(Short.MAX_VALUE, tfApplyPath.getPreferredSize().height));
		JButton btnApply = new JButton("Apply...");
		btnApply.addActionListener(e -> {
			Platform platform = this.getSelectedNode(Platform.class);
			if (platform != null) {
				JFileChooser fileChooser = new JFileChooser(new File(".").getAbsoluteFile());
				fileChooser.setSelectedFile(new File(tfApplyPath.getText()));
				int rv = fileChooser.showOpenDialog(p);
				if (rv == JFileChooser.APPROVE_OPTION) {
					File snapshotFile = fileChooser.getSelectedFile();
					tfApplyPath.setText(snapshotFile.getAbsolutePath());
					this.platformApplySnapshot(platform, snapshotFile);
				}
			}
			else {
			}
		});
		pnlApply.add(tfApplyPath);
		pnlApply.add(btnApply);

		p.add(pnlSave);
		p.add(pnlApply);
		p.add(new Box.Filler(new Dimension(0, 0), new Dimension(0, Short.MAX_VALUE),
				new Dimension(0, Short.MAX_VALUE)));
		return p;
	}

	JPanel createLayoutPanel() {
		JPanel p = new JPanel();
		p.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
		p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
		JPanel pnlPreset = new JPanel();
		pnlPreset.setLayout(new BoxLayout(pnlPreset, BoxLayout.X_AXIS));
		pnlPreset.setBorder(BorderFactory.createTitledBorder("Apply Preset"));
		JComboBox<String> cbPreset = new JComboBox<>(new String[] { "columns", "grid", "rows", "tabs" });
		cbPreset.setPreferredSize(new Dimension(Short.MAX_VALUE, cbPreset.getPreferredSize().height));
		JButton btnApply = new JButton("Apply");
		btnApply.addActionListener(e -> {
			Window win = this.getSelectedNode(Window.class);
			if (win != null) {
				Layout layout = Layout.wrap(win.getIdentity(), this.desktopConnection);
				layout.applyPreset(cbPreset.getSelectedItem().toString());
			}
			else {
			}
		});
		pnlPreset.add(cbPreset);
		pnlPreset.add(btnApply);

		JPanel pnlSave = new JPanel();
		pnlSave.setBorder(BorderFactory.createTitledBorder("Save Layout"));
		pnlSave.setLayout(new BoxLayout(pnlSave, BoxLayout.X_AXIS));
		JTextField tfSavePath = new JTextField(new File("layout.json").getAbsolutePath().toString());
		tfSavePath.setPreferredSize(new Dimension(Short.MAX_VALUE, tfSavePath.getPreferredSize().height));
		JButton btnSave = new JButton("Save...");
		btnSave.addActionListener(e -> {
			Window win = this.getSelectedNode(Window.class);
			if (win != null) {
				Layout layout = Layout.wrap(win.getIdentity(), this.desktopConnection);
				JFileChooser fileChooser = new JFileChooser(new File(".").getAbsoluteFile());
				fileChooser.setSelectedFile(new File(tfSavePath.getText()));
				int rv = fileChooser.showOpenDialog(p);
				if (rv == JFileChooser.APPROVE_OPTION) {
					File layoutFile = fileChooser.getSelectedFile();
					tfSavePath.setText(layoutFile.getAbsolutePath());
					layoutSaveLayout(layout, layoutFile);
				}
			}
			else {
			}
		});
		pnlSave.add(tfSavePath);
		pnlSave.add(btnSave);

		JPanel pnlReplace = new JPanel();
		pnlReplace.setBorder(BorderFactory.createTitledBorder("Replace Layout"));
		pnlReplace.setLayout(new BoxLayout(pnlReplace, BoxLayout.X_AXIS));
		JTextField tfReplacePath = new JTextField(new File("layout.json").getAbsolutePath().toString());
		tfReplacePath.setPreferredSize(new Dimension(Short.MAX_VALUE, tfReplacePath.getPreferredSize().height));
		JButton btnReplace = new JButton("Replace...");
		btnReplace.addActionListener(e -> {
			Window win = this.getSelectedNode(Window.class);
			if (win != null) {
				Layout layout = Layout.wrap(win.getIdentity(), this.desktopConnection);
				JFileChooser fileChooser = new JFileChooser(new File(".").getAbsoluteFile());
				fileChooser.setSelectedFile(new File(tfReplacePath.getText()));
				int rv = fileChooser.showOpenDialog(p);
				if (rv == JFileChooser.APPROVE_OPTION) {
					File layoutFile = fileChooser.getSelectedFile();
					tfReplacePath.setText(layoutFile.getAbsolutePath());
					layoutReplaceLayout(layout, layoutFile);
				}
			}
			else {
			}
		});
		pnlReplace.add(tfReplacePath);
		pnlReplace.add(btnReplace);

		p.add(pnlPreset);
		p.add(pnlSave);
		p.add(pnlReplace);
		p.add(new Box.Filler(new Dimension(0, 0), new Dimension(0, Short.MAX_VALUE),
				new Dimension(0, Short.MAX_VALUE)));
		return p;
	}

	JPanel createContentPane() {
		JPanel pnlLeft = this.createRuntimeTreePanel();
		JPanel pnlRight = new JPanel(new BorderLayout());
		pnlRight.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

		JTabbedPane tabs = new JTabbedPane();
		tabs.addTab("Platform", createPlatformPanel());
		tabs.addTab("Window", createWindowPanel());
		tabs.addTab("View", createViewPanel());
		tabs.addTab("Snapshot", createSnapshotPanel());
		tabs.addTab("Layout", createLayoutPanel());

		pnlRight.add(tabs, BorderLayout.CENTER);
		JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, pnlLeft, pnlRight);
		splitPane.setDividerLocation(350);
		JPanel pnl = new JPanel(new BorderLayout());
		pnl.add(splitPane, BorderLayout.CENTER);

		return pnl;
	}

	void createGui() {
		this.frame = new JFrame("OpenFin Platform API Demo");
		this.frame.addWindowListener(new WindowAdapter() {
			@Override
			public void windowClosing(WindowEvent e) {
				PlatformApiDemo.this.frame.setVisible(false);
				try {
					PlatformApiDemo.this.desktopConnection.disconnect();
				}
				catch (DesktopException e1) {
					e1.printStackTrace();
				}
			}
		});

		this.glassPane = this.createGlassPane();
		this.frame.setGlassPane(glassPane);
		this.glassPane.setVisible(true);
		this.frame.setContentPane(this.createContentPane());
		this.frame.setPreferredSize(new Dimension(850, 600));
		this.frame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
		this.frame.pack();
		this.frame.setLocationRelativeTo(null);
		this.frame.setVisible(true);
	}

	void addPlatformNode(String uuid) {
		SwingUtilities.invokeLater(() -> {
			Platform platform = Platform.wrap(uuid, this.desktopConnection);
			DefaultMutableTreeNode node = new DefaultMutableTreeNode(platform);
			this.platformTreeModel.insertNodeInto(node, this.rootNode, this.rootNode.getChildCount());
			this.runtimeTree.expandRow(0);
		});
	}

	void deletePlatformNode(String uuid) {
		SwingUtilities.invokeLater(() -> {
			// find platform node
			for (int i = 0; i < this.rootNode.getChildCount(); i++) {
				DefaultMutableTreeNode n = (DefaultMutableTreeNode) this.rootNode.getChildAt(i);
				if (((Platform) n.getUserObject()).getUuid().equals(uuid)) {
					this.platformTreeModel.removeNodeFromParent(n);
					break;
				}
			}
		});
	}

	void addWindowNode(String uuid, String name) {
		SwingUtilities.invokeLater(() -> {
			Window window = Window.wrap(uuid, name, this.desktopConnection);
			DefaultMutableTreeNode node = new DefaultMutableTreeNode(window);
			// find platform node
			DefaultMutableTreeNode platformNode = null;
			for (int i = 0; platformNode == null && i < this.rootNode.getChildCount(); i++) {
				DefaultMutableTreeNode n = (DefaultMutableTreeNode) this.rootNode.getChildAt(i);
				if (((Platform) n.getUserObject()).getUuid().equals(uuid)) {
					platformNode = n;
				}
			}
			if (platformNode != null) {
				this.platformTreeModel.insertNodeInto(node, platformNode, platformNode.getChildCount());
				this.runtimeTree.expandPath(new TreePath(platformNode.getPath()));
			}
		});
	}

	void deleteWindowNode(String uuid, String name) {
		SwingUtilities.invokeLater(() -> {
			// find platform node
			for (int i = 0; i < this.rootNode.getChildCount(); i++) {
				DefaultMutableTreeNode n = (DefaultMutableTreeNode) this.rootNode.getChildAt(i);
				if (((Platform) n.getUserObject()).getUuid().equals(uuid)) {
					for (int j = 0; j < n.getChildCount(); j++) {
						DefaultMutableTreeNode w = (DefaultMutableTreeNode) n.getChildAt(j);
						if (((Window) w.getUserObject()).getName().equals(name)) {
							this.platformTreeModel.removeNodeFromParent(w);
							break;
						}
					}
					break;
				}
			}
		});
	}

	void launchOpenFin() throws DesktopIOException, IOException, DesktopException {
		RuntimeConfiguration runtimeConfiguration = new RuntimeConfiguration();
		runtimeConfiguration.setRuntimeVersion("stable");
		runtimeConfiguration.setAdditionalRuntimeArguments("--v=1");
		this.desktopConnection = new DesktopConnection(UUID.randomUUID().toString());
		this.desktopConnection.connect(runtimeConfiguration, new DesktopStateListener() {
			@Override
			public void onReady() {
				OpenFinRuntime sys = new OpenFinRuntime(PlatformApiDemo.this.desktopConnection);
				try {
					sys.addEventListener("application-platform-api-ready", e -> {
						System.out.println("application-platform-api-ready: " + e.getEventObject());
						String uuid = e.getEventObject().getString("uuid");
						addPlatformNode(uuid);
					}, null);
					sys.addEventListener("application-closed", e -> {
						System.out.println("application-closed: " + e.getEventObject());
						String uuid = e.getEventObject().getString("uuid");
						deletePlatformNode(uuid);
					}, null);
					sys.addEventListener("window-created", e -> {
						System.out.println("window-created: " + e.getEventObject());
						String uuid = e.getEventObject().getString("uuid");
						String name = e.getEventObject().getString("name");
						addWindowNode(uuid, name);
					}, null);
					sys.addEventListener("window-closed", e -> {
						System.out.println("window-closed: " + e.getEventObject());
						String uuid = e.getEventObject().getString("uuid");
						String name = e.getEventObject().getString("name");
						deleteWindowNode(uuid, name);
					}, null);
				}
				catch (DesktopException e) {
					e.printStackTrace();
				}
				SwingUtilities.invokeLater(() -> {
					PlatformApiDemo.this.glassPane.setVisible(false);
				});
			}

			@Override
			public void onClose(String error) {
				System.exit(0);
			}

			@Override
			public void onError(String reason) {
			}

			@Override
			public void onMessage(String message) {
			}

			@Override
			public void onOutgoingMessage(String message) {
			}

		}, 60);
	}

	void platformStartFromManifest(String manifest) {
		Platform.startFromManifest(desktopConnection, manifest).exceptionally(e -> {
			e.printStackTrace();
			return null;
		});
	}

	void platformStart(String uuid, String width, String height, boolean center) {
		PlatformOptions opts = new PlatformOptions(uuid);
		PlatformWindowOptions winOpts = new PlatformWindowOptions();
		if (!width.isEmpty()) {
			winOpts.setDefaultWidth(Integer.parseInt(width));
		}
		if (!height.isEmpty()) {
			winOpts.setDefaultHeight(Integer.parseInt(height));
		}
		if (center) {
			winOpts.setDefaultCentered(center);
		}
		opts.setDefaultWindowOptions(winOpts);
		Platform.start(desktopConnection, opts).exceptionally(e -> {
			e.printStackTrace();
			return null;
		});
	}

	void platformCreateWindow(Platform platform, String winName, String url, boolean initLayout, String width,
			String height, boolean center) {
		WindowOptions winOpts = new WindowOptions();
		if (!width.isEmpty()) {
			winOpts.setDefaultWidth(Integer.parseInt(width));
		}
		if (!height.isEmpty()) {
			winOpts.setDefaultHeight(Integer.parseInt(height));
		}
		if (center) {
			winOpts.setDefaultCentered(center);
		}

		winOpts.setName(winName);
		if (initLayout) {
			LayoutContentItemStateOptions itemState1 = new LayoutContentItemStateOptions();
			itemState1.setName(winName + "_default");
			itemState1.setUrl(url);
			LayoutContentItemOptions itemOpts1 = new LayoutContentItemOptions();
			itemOpts1.setType("component");
			itemOpts1.setComponentName("view");
			itemOpts1.setLayoutContentItemStateOptions(itemState1);
			LayoutContentOptionsImpl content = new LayoutContentOptionsImpl();
			content.setType("stack");
			content.setContent(itemOpts1);
			LayoutOptions layoutOptions = new LayoutOptions();
			layoutOptions.setContent(content);
			winOpts.setLayoutOptions(layoutOptions);
		}
		else {
			winOpts.setUrl(url);
		}

		platform.createWindow(winOpts);
	}

	void platformCreateView(Platform platform, PlatformViewOptions viewOpts, Identity targtWindow) {
		platform.createView(viewOpts, targtWindow);
	}

	void platformSaveSnapshot(Platform platform, File path) {
		platform.getSnapshot().thenAccept(snapshot -> {
			try {
				Files.write(path.toPath(), snapshot.getJson().toString().getBytes(), StandardOpenOption.CREATE,
						StandardOpenOption.TRUNCATE_EXISTING);
			}
			catch (IOException e) {
				e.printStackTrace();
			}
		});
	}

	void platformApplySnapshot(Platform platform, File path) {
		platform.applySnapshot(path.getAbsolutePath(), null);
	}

	void layoutSaveLayout(Layout layout, File path) {
		layout.getConfig().thenAccept(layougConfig -> {
			try {
				Files.write(path.toPath(), layougConfig.getJson().toString().getBytes(), StandardOpenOption.CREATE,
						StandardOpenOption.TRUNCATE_EXISTING);
			}
			catch (IOException e) {
				e.printStackTrace();
			}
		});
	}

	void layoutReplaceLayout(Layout layout, File path) {
		try {
			String layoutString = new String(Files.readAllBytes(path.toPath()));
			LayoutOptions opts = new LayoutOptions(new JSONObject(layoutString));
			layout.replace(opts);
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		finally {

		}
	}

	public static void main(String[] args) {
		new PlatformApiDemo();
	}
}
