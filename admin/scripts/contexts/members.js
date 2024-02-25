/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원관리화면을 구성한다.
 *
 * @file /modules/member/admin/scripts/members.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 25.
 */
Admin.ready(async () => {
    const me = Admin.getModule('member');
    return new Aui.Tab.Panel({
        id: 'members-context',
        iconClass: 'xi xi-users',
        title: (await me.getText('admin.contexts.members')),
        border: false,
        layout: 'fit',
        items: [
            new Aui.Panel({
                id: 'lists',
                iconClass: 'xi xi-users',
                title: (await me.getText('admin.members.title')),
                layout: 'column',
                border: false,
                topbar: [
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.members.add')),
                        handler: () => {
                            me.members.add();
                        },
                    }),
                ],
                items: [
                    new Aui.Tab.Panel({
                        id: 'types',
                        border: [false, true, false, false],
                        width: 320,
                        tabPosition: 'hidden',
                        items: [
                            new Aui.Tree.Panel({
                                id: 'groups',
                                border: false,
                                layout: 'fit',
                                selection: { selectable: true, keepable: true },
                                autoLoad: false,
                                topbar: [
                                    new Aui.Form.Field.Search({
                                        flex: 1,
                                        emptyText: (await me.getText('keyword')),
                                        handler: async (keyword) => {
                                            const groups = Aui.getComponent('groups');
                                            if (keyword.length > 0) {
                                                groups.getStore().setFilter('title', keyword, 'like');
                                            }
                                            else {
                                                groups.getStore().resetFilter();
                                            }
                                        },
                                    }),
                                    new Aui.Button({
                                        iconClass: 'mi mi-plus',
                                        text: (await me.getText('admin.groups.add')),
                                        handler: () => {
                                            me.groups.add();
                                        },
                                    }),
                                ],
                                store: new Aui.TreeStore.Remote({
                                    url: me.getProcessUrl('groups'),
                                    primaryKeys: ['group_id'],
                                    fields: [
                                        'group_id',
                                        'title',
                                        { name: 'members', type: 'int' },
                                        { name: 'sort', type: 'int' },
                                    ],
                                    remoteExpand: true,
                                    remoteFilter: true,
                                    sorters: { sort: 'ASC' },
                                }),
                                columns: [
                                    {
                                        text: (await me.getText('admin.groups.title')),
                                        dataIndex: 'title',
                                        sortable: 'sort',
                                        flex: 1,
                                    },
                                    {
                                        text: (await me.getText('admin.groups.members')),
                                        dataIndex: 'members',
                                        sortable: true,
                                        width: 70,
                                        textAlign: 'right',
                                        renderer: (value) => {
                                            return Format.number(value);
                                        },
                                    },
                                ],
                                bottombar: [
                                    new Aui.Button({
                                        iconClass: 'mi mi-refresh',
                                        handler: (button) => {
                                            const tree = button.getParent().getParent();
                                            tree.getStore().reload();
                                        },
                                    }),
                                    '->',
                                    new Aui.SegmentedButton({
                                        items: [
                                            new Aui.Button({
                                                text: me.printText('admin.members.lists.group'),
                                                value: 'groups',
                                                pressed: true,
                                                handler: (button) => {
                                                    const tab = button
                                                        .getParent()
                                                        .getParent()
                                                        .getParent()
                                                        .getParent();
                                                    tab.active(0);
                                                },
                                            }),
                                            new Aui.Button({
                                                text: me.printText('admin.members.lists.level'),
                                                value: 'levels',
                                                handler: (button) => {
                                                    const tab = button
                                                        .getParent()
                                                        .getParent()
                                                        .getParent()
                                                        .getParent();
                                                    tab.active(1);
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                                listeners: {
                                    update: (tree) => {
                                        if (Admin.getContextSubUrl(0) == 'lists' &&
                                            Admin.getContextSubUrl(1) == 'groups') {
                                            if (tree.getSelections().length == 0 &&
                                                Admin.getContextSubUrl(2) !== null) {
                                                tree.select({ group_id: Admin.getContextSubUrl(2) });
                                            }
                                            if (tree.getSelections().length == 0) {
                                                tree.select({ group_id: 'all' });
                                            }
                                        }
                                    },
                                    openItem: (record) => {
                                        if (record.get('group_id') != 'all') {
                                            me.groups.add(record.get('group_id'));
                                        }
                                    },
                                    openMenu: (menu, record) => {
                                        menu.setTitle(record.get('title'));
                                        menu.add({
                                            text: me.printText('admin.groups.add_child'),
                                            iconClass: 'mi mi-plus',
                                            handler: async () => {
                                                me.groups.add(null, record.data.group_id);
                                                return true;
                                            },
                                        });
                                        if (record.get('group_id') != 'all') {
                                            menu.add({
                                                text: me.printText('admin.groups.edit'),
                                                iconClass: 'xi xi-form-checkout',
                                                handler: async () => {
                                                    me.groups.add(record.get('group_id'));
                                                    return true;
                                                },
                                            });
                                            menu.add({
                                                text: me.printText('admin.groups.delete'),
                                                iconClass: 'mi mi-trash',
                                                handler: async () => {
                                                    me.groups.delete(record.get('group_id'));
                                                    return true;
                                                },
                                            });
                                        }
                                    },
                                    selectionChange: (selections) => {
                                        const members = Aui.getComponent('members');
                                        const assign = members.getToolbar('top').getItemAt(2);
                                        if (selections.length == 1) {
                                            const group_id = selections[0].get('group_id');
                                            members.getStore().setParam('group_id', group_id);
                                            members.getStore().setParam('level_id', null);
                                            members.getStore().loadPage(1);
                                            members.enable();
                                            Aui.getComponent('members-context').properties.setUrl();
                                            if (group_id == 'all') {
                                                assign.hide();
                                            }
                                            else {
                                                assign.show();
                                            }
                                        }
                                        else {
                                            members.disable();
                                            assign.hide();
                                        }
                                    },
                                },
                            }),
                            new Aui.Grid.Panel({
                                id: 'levels',
                                border: false,
                                layout: 'fit',
                                selection: { selectable: true, keepable: true },
                                autoLoad: false,
                                topbar: [
                                    new Aui.Form.Field.Search({
                                        flex: 1,
                                        emptyText: (await me.getText('keyword')),
                                        handler: async (keyword) => {
                                            const groups = Aui.getComponent('groups');
                                            if (keyword.length > 0) {
                                                groups.getStore().setFilter('title', keyword, 'like');
                                            }
                                            else {
                                                groups.getStore().resetFilter();
                                            }
                                        },
                                    }),
                                    new Aui.Button({
                                        iconClass: 'mi mi-plus',
                                        text: (await me.getText('admin.levels.add')),
                                        handler: () => {
                                            me.levels.add();
                                        },
                                    }),
                                ],
                                store: new Aui.Store.Remote({
                                    url: me.getProcessUrl('levels'),
                                    primaryKeys: ['level_id'],
                                    fields: [
                                        { name: 'level_id', type: 'int' },
                                        'title',
                                        { name: 'members', type: 'int' },
                                    ],
                                    sorters: { level_id: 'ASC' },
                                }),
                                columns: [
                                    {
                                        text: (await me.getText('admin.levels.title')),
                                        dataIndex: 'title',
                                        sortable: 'level_id',
                                        flex: 1,
                                        renderer: (value, record) => {
                                            return '<b class="level">' + record.get('level_id') + '</b>' + value;
                                        },
                                    },
                                    {
                                        text: (await me.getText('admin.levels.members')),
                                        dataIndex: 'members',
                                        sortable: true,
                                        width: 70,
                                        textAlign: 'right',
                                        renderer: (value) => {
                                            return Format.number(value);
                                        },
                                    },
                                ],
                                bottombar: [
                                    new Aui.Button({
                                        iconClass: 'mi mi-refresh',
                                        handler: (button) => {
                                            const grid = button.getParent().getParent();
                                            grid.getStore().reload();
                                        },
                                    }),
                                    '->',
                                    new Aui.SegmentedButton({
                                        items: [
                                            new Aui.Button({
                                                text: me.printText('admin.members.lists.group'),
                                                value: 'groups',
                                                handler: (button) => {
                                                    const tab = button
                                                        .getParent()
                                                        .getParent()
                                                        .getParent()
                                                        .getParent();
                                                    tab.active(0);
                                                },
                                            }),
                                            new Aui.Button({
                                                text: me.printText('admin.members.lists.level'),
                                                pressed: true,
                                                value: 'levels',
                                                handler: (button) => {
                                                    const tab = button
                                                        .getParent()
                                                        .getParent()
                                                        .getParent()
                                                        .getParent();
                                                    tab.active(1);
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                                listeners: {
                                    update: (grid) => {
                                        if (Admin.getContextSubUrl(0) == 'lists' &&
                                            Admin.getContextSubUrl(1) == 'levels') {
                                            if (grid.getSelections().length == 0 &&
                                                Admin.getContextSubUrl(2) !== null) {
                                                grid.select({ level_id: parseInt(Admin.getContextSubUrl(2), 10) });
                                            }
                                            if (grid.getSelections().length == 0) {
                                                grid.select({ level_id: 0 });
                                            }
                                        }
                                    },
                                    openItem: (record) => {
                                        me.levels.add(record.get('level_id'));
                                    },
                                    openMenu: (menu, record) => {
                                        menu.setTitle(record.get('title'));
                                        menu.add({
                                            text: me.printText('admin.levels.edit'),
                                            iconClass: 'xi xi-form-checkout',
                                            handler: async () => {
                                                me.levels.add(record.get('level_id'));
                                                return true;
                                            },
                                        });
                                        menu.add({
                                            text: me.printText('admin.levels.delete'),
                                            iconClass: 'mi mi-trash',
                                            handler: async () => {
                                                me.levels.delete(record.get('level_id'));
                                                return true;
                                            },
                                        });
                                    },
                                    selectionChange: (selections) => {
                                        const members = Aui.getComponent('members');
                                        if (selections.length == 1) {
                                            const level_id = selections[0].get('level_id');
                                            members.getStore().setParam('group_id', null);
                                            members.getStore().setParam('level_id', level_id);
                                            members.getStore().loadPage(1);
                                            members.enable();
                                            Aui.getComponent('members-context').properties.setUrl();
                                        }
                                        else {
                                            members.disable();
                                        }
                                    },
                                },
                            }),
                        ],
                        listeners: {
                            render: (tab) => {
                                if (Admin.getContextSubUrl(0) == 'lists') {
                                    const type = Admin.getContextSubUrl(1);
                                    if (type !== null) {
                                        tab.active(type);
                                    }
                                }
                            },
                            active: (panel) => {
                                const members = Aui.getComponent('members');
                                const assign = members.getToolbar('top').getItemAt(2);
                                if (panel.getId() == 'groups') {
                                    const groups = panel;
                                    if (groups.getStore().isLoaded() == false) {
                                        groups.getStore().load();
                                    }
                                    groups.fireEvent('selectionChange', [groups.getSelections()]);
                                }
                                else {
                                    const levels = panel;
                                    if (levels.getStore().isLoaded() == false) {
                                        levels.getStore().load();
                                    }
                                    else {
                                        levels.fireEvent('selectionChange', [levels.getSelections()]);
                                    }
                                    assign.hide();
                                }
                                Aui.getComponent('members-context').properties.setUrl();
                            },
                        },
                    }),
                    new Aui.Grid.Panel({
                        id: 'members',
                        border: [false, false, false, true],
                        minWidth: 300,
                        flex: 1,
                        selection: { selectable: true, display: 'check' },
                        autoLoad: false,
                        disabled: true,
                        topbar: [
                            new Aui.Form.Field.Search({
                                width: 200,
                                emptyText: (await me.getText('keyword')),
                                handler: async (keyword) => {
                                    const members = Aui.getComponent('members');
                                    if (keyword?.length > 0) {
                                        members.getStore().setParam('keyword', keyword);
                                    }
                                    else {
                                        members.getStore().setParam('keyword', null);
                                    }
                                    await members.getStore().loadPage(1);
                                },
                            }),
                            '->',
                            new Aui.Button({
                                iconClass: 'mi mi-group-o',
                                text: (await me.getText('admin.groups.assign')),
                                handler: () => {
                                    const groups = Aui.getComponent('groups');
                                    const members = Aui.getComponent('members');
                                    const group_id = members.getStore().getParam('group_id');
                                    if (group_id === null || group_id === 'all') {
                                        return;
                                    }
                                    const title = groups.getStore().find({ group_id: group_id })?.get('title') ?? null;
                                    me.groups.assign(group_id, title);
                                },
                            }),
                        ],
                        bottombar: new Aui.Grid.Pagination([
                            new Aui.Button({
                                iconClass: 'mi mi-refresh',
                                handler: (button) => {
                                    const grid = button.getParent().getParent();
                                    grid.getStore().reload();
                                },
                            }),
                        ]),
                        store: new Aui.Store.Remote({
                            url: me.getProcessUrl('members'),
                            fields: [
                                'member_id',
                                'email',
                                'name',
                                'nickname',
                                'photo',
                                { name: 'joined_at', type: 'int' },
                                { name: 'logged_at', type: 'int' },
                            ],
                            primaryKeys: ['member_id'],
                            limit: 50,
                            remoteSort: true,
                            sorters: { joined_at: 'DESC' },
                        }),
                        columns: [
                            {
                                dataIndex: 'member_id',
                                width: 60,
                                textAlign: 'right',
                                sortable: true,
                            },
                            {
                                text: (await me.getText('email')),
                                dataIndex: 'email',
                                sortable: true,
                                width: 200,
                            },
                            {
                                text: (await me.getText('name')),
                                dataIndex: 'name',
                                width: 150,
                                sortable: true,
                                renderer: (value, record) => {
                                    return ('<i class="photo" style="background-image:url(' +
                                        record.data.photo +
                                        ')"></i>' +
                                        value);
                                },
                            },
                            {
                                text: (await me.getText('nickname')),
                                dataIndex: 'nickname',
                                sortable: true,
                                width: 140,
                            },
                            {
                                text: (await me.getText('groups')),
                                dataIndex: 'groups',
                                width: 160,
                                renderer: (value) => {
                                    return value.join(', ');
                                },
                            },
                            {
                                text: (await me.getText('level')),
                                dataIndex: 'level',
                                width: 80,
                            },
                            {
                                text: (await me.getText('joined_at')),
                                dataIndex: 'joined_at',
                                width: 160,
                                sortable: true,
                                renderer: (value) => {
                                    return Format.date('Y.m.d(D) H:i', value);
                                },
                            },
                            {
                                text: (await me.getText('logged_at')),
                                dataIndex: 'logged_at',
                                width: 160,
                                sortable: true,
                                renderer: (value) => {
                                    if (value > 0) {
                                        return Format.date('Y.m.d(D) H:i', value);
                                    }
                                    else {
                                        return '';
                                    }
                                },
                            },
                        ],
                        listeners: {
                            openItem: (record) => {
                                me.members.add(record.get('member_id'));
                            },
                            openMenu: (menu, record, _rowIndex, grid) => {
                                menu.setTitle(record.get('email'));
                                menu.add({
                                    text: me.printText('admin.members.edit'),
                                    iconClass: 'xi xi-form-checkout',
                                    handler: async () => {
                                        me.members.add(record.get('member_id'));
                                        return true;
                                    },
                                });
                                menu.add('-');
                                if (grid.getStore().getParam('group_id') !== null &&
                                    grid.getStore().getParam('group_id') !== 'user') {
                                    menu.add({
                                        text: me.printText('admin.members.remove'),
                                        iconClass: 'xi xi-folder-remove',
                                        handler: async () => {
                                            me.members.remove();
                                            return true;
                                        },
                                    });
                                }
                                menu.add({
                                    text: me.printText('admin.members.deactive'),
                                    iconClass: 'xi xi-slash-circle',
                                    handler: async () => {
                                        me.members.deactive();
                                        return true;
                                    },
                                });
                            },
                            openMenus: (menu, selections) => {
                                menu.setTitle(Aui.printText('texts.selected_person', {
                                    count: selections.length.toString(),
                                }));
                                menu.add({
                                    text: me.printText('admin.members.deactive'),
                                    iconClass: 'xi xi-slash-circle',
                                    handler: async () => {
                                        me.members.deactive();
                                        return true;
                                    },
                                });
                            },
                        },
                    }),
                ],
            }),
            new Aui.Grid.Panel({
                id: 'logs',
                iconClass: 'xi xi-time-back',
                title: (await me.getText('admin.logs.title')),
                border: false,
                layout: 'fit',
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Search({
                        width: 200,
                        emptyText: (await me.getText('keyword')),
                    }),
                ],
                bottombar: new Aui.Grid.Pagination([
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        text: (await me.getText('admin.logs.time')),
                        dataIndex: 'time',
                        width: 180,
                        textAlign: 'center',
                        sortable: true,
                        renderer: (value) => {
                            return Format.date('Y.m.d(D) H:i:s', value);
                        },
                    },
                    {
                        text: (await me.getText('name')),
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return ('<i class="photo" style="background-image:url(' +
                                record.get('photo') +
                                ')"></i>' +
                                value);
                        },
                    },
                    {
                        text: (await me.getText('email')),
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await me.getText('admin.logs.component')),
                        dataIndex: 'component',
                        width: 150,
                    },
                    {
                        text: (await me.getText('admin.logs.message')),
                        dataIndex: 'log_type',
                        minWidth: 250,
                        flex: 1,
                    },
                    {
                        text: 'IP',
                        dataIndex: 'ip',
                        width: 110,
                    },
                ],
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('logs'),
                    primaryKeys: ['time', 'member_id'],
                    fields: [{ name: 'time', type: 'float' }],
                    limit: 50,
                    remoteSort: true,
                    sorters: { time: 'DESC' },
                }),
                listeners: {
                    openItem: (record) => { },
                    openMenu: (menu, record) => { },
                },
            }),
        ],
        listeners: {
            render: (tab) => {
                const panel = Admin.getContextSubUrl(0);
                if (panel !== null) {
                    tab.active(panel);
                }
            },
            active: (panel) => {
                Aui.getComponent('members-context').properties.setUrl();
                if (panel.getId() == 'logs') {
                    const logs = Aui.getComponent('logs');
                    if (logs.getStore().isLoaded() == false) {
                        logs.getStore().load();
                    }
                }
            },
        },
        setUrl: () => {
            const context = Aui.getComponent('members-context');
            if (Admin.getContextSubUrl(0) !== context.getActiveTab().getId()) {
                Admin.setContextSubUrl('/' + context.getActiveTab().getId());
            }
            if (Admin.getContextSubUrl(0) == 'lists') {
                const types = Aui.getComponent('types');
                if (Admin.getContextSubUrl(1) !== types.getActiveTab().getId()) {
                    Admin.setContextSubUrl('/lists/' + types.getActiveTab().getId());
                }
                if (Admin.getContextSubUrl(1) == 'groups') {
                    const groups = Aui.getComponent('groups');
                    const group_id = groups.getSelections().at(0)?.get('group_id') ?? null;
                    if (group_id !== null && Admin.getContextSubUrl(1) !== group_id) {
                        Admin.setContextSubUrl('/lists/groups/' + group_id);
                    }
                }
                if (Admin.getContextSubUrl(1) == 'levels') {
                    const levels = Aui.getComponent('levels');
                    const level_id = levels.getSelections().at(0)?.get('level_id') ?? null;
                    if (level_id !== null && Admin.getContextSubUrl(1) !== level_id) {
                        Admin.setContextSubUrl('/lists/levels/' + level_id);
                    }
                }
            }
        },
    });
});
