/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/member/admin/scripts/Member.ts
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2025. 1. 9.
 */
var modules;
(function (modules) {
    let member;
    (function (member) {
        let admin;
        (function (admin) {
            class Member extends modules.admin.admin.Component {
                groups = {
                    /**
                     * 그룹을 추가한다.
                     *
                     * @param {string} group_id - 그룹정보를 수정할 경우 수정할 group_id
                     * @param {string} parent - 상위그룹 group_id
                     */
                    add: (group_id = null, parent = null) => {
                        new Aui.Window({
                            title: this.printText('admin.groups.' + (group_id === null ? 'add' : 'edit')),
                            width: 500,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: [
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.groups.defaults'),
                                            items: [
                                                new Aui.Form.Field.Select({
                                                    name: 'parent_id',
                                                    label: this.printText('admin.groups.parent'),
                                                    store: new Aui.TreeStore.Remote({
                                                        url: Modules.get('member').getProcessUrl('groups'),
                                                        primaryKeys: ['group_id'],
                                                        params: {
                                                            mode: 'tree',
                                                        },
                                                        remoteExpand: true,
                                                        sorters: { sort: 'ASC' },
                                                    }),
                                                    listField: 'title',
                                                    displayField: 'title',
                                                    valueField: 'group_id',
                                                    search: true,
                                                    value: parent,
                                                }),
                                                new Aui.Form.Field.Text({
                                                    name: 'title',
                                                    label: this.printText('admin.groups.title'),
                                                }),
                                                new Aui.Form.Field.Text({
                                                    name: 'group_id',
                                                    label: this.printText('admin.groups.group_id'),
                                                    helpText: this.printText('admin.groups.group_id_help'),
                                                }),
                                            ],
                                        }),
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.groups.positions'),
                                            items: [
                                                new Aui.Form.Field.Text({
                                                    name: 'manager',
                                                    label: this.printText('admin.groups.manager'),
                                                    helpText: this.printText('admin.groups.manager_help'),
                                                }),
                                                new Aui.Form.Field.Text({
                                                    name: 'member',
                                                    label: this.printText('admin.groups.member'),
                                                    helpText: this.printText('admin.groups.member_help'),
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent();
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent();
                                        const form = button.getParent().getItemAt(0);
                                        const results = await form.submit({
                                            url: this.getProcessUrl('group'),
                                            params: { group_id: group_id },
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                message: Aui.printText('actions.saved'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const groups = Aui.getComponent('groups');
                                                    await groups.getStore().reload();
                                                    await groups.getStore().getParents({ group_id: results.group_id });
                                                    groups.select({ group_id: results.group_id });
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0);
                                    if (group_id !== null) {
                                        const results = await form.load({
                                            url: this.getProcessUrl('group'),
                                            params: { group_id: group_id },
                                        });
                                        if (results.success == true) {
                                        }
                                        else {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                    /**
                     * 그룹구성원을 추가한다.
                     *
                     * @param {string} group_id - 구성원을 추가할 그룹아이디
                     * @param {string} title - 구성원을 추가할 그룹명
                     */
                    assign: (group_id, title = null) => {
                        new Aui.Window({
                            title: this.printText('admin.groups.assign') + (title ? ' (' + title + ')' : ''),
                            width: 800,
                            height: 600,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Grid.Panel({
                                    border: [false, true, false, false],
                                    selection: { selectable: true, type: 'check', keepable: true },
                                    autoLoad: true,
                                    freeze: 1,
                                    layout: 'fit',
                                    topbar: [
                                        new Aui.Form.Field.Search({
                                            width: 200,
                                            emptyText: this.printText('keyword'),
                                            handler: async (keyword, field) => {
                                                const grid = field.getParent().getParent();
                                                if (keyword?.length > 0) {
                                                    grid.getStore().setParam('keyword', keyword);
                                                }
                                                else {
                                                    grid.getStore().setParam('keyword', null);
                                                }
                                                await grid.getStore().loadPage(1);
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
                                        '->',
                                        new Aui.Form.Field.Display({
                                            value: Aui.printText('texts.selected_person', { count: '0' }),
                                        }),
                                    ]),
                                    columns: [
                                        {
                                            text: '#',
                                            dataIndex: 'member_id',
                                            width: 60,
                                            textAlign: 'right',
                                            sortable: true,
                                        },
                                        {
                                            text: this.printText('email'),
                                            dataIndex: 'email',
                                            minWidth: 200,
                                        },
                                        {
                                            text: this.printText('name'),
                                            dataIndex: 'name',
                                            width: 150,
                                            renderer: (value, record) => {
                                                return ('<i class="photo" style="background-image:url(' +
                                                    record.get('photo') +
                                                    ')"></i>' +
                                                    value);
                                            },
                                        },
                                        {
                                            text: this.printText('nickname'),
                                            dataIndex: 'nickname',
                                            width: 150,
                                        },
                                        {
                                            text: this.printText('joined_at'),
                                            dataIndex: 'joined_at',
                                            width: 160,
                                            sortable: true,
                                            renderer: (value) => {
                                                return Format.date('Y.m.d(D) H:i', value);
                                            },
                                        },
                                    ],
                                    store: new Aui.Store.Remote({
                                        url: Admin.getProcessUrl('module', 'member', 'members'),
                                        fields: [
                                            { name: 'member_id', type: 'int' },
                                            'email',
                                            'name',
                                            'nickname',
                                            'photo',
                                            'joined_at',
                                            'logged_at',
                                        ],
                                        primaryKeys: ['member_id'],
                                        limit: 50,
                                        remoteSort: true,
                                        sorters: { joined_at: 'DESC' },
                                        remoteFilter: true,
                                        filters: { status: 'ACTIVATED' },
                                    }),
                                    listeners: {
                                        selectionChange: (selections, grid) => {
                                            const display = grid
                                                .getToolbar('bottom')
                                                .getItemAt(-1);
                                            display.setValue(Aui.printText('texts.selected_person', {
                                                count: selections.length.toString(),
                                            }));
                                        },
                                    },
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent();
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent();
                                        const grid = window.getItemAt(0);
                                        const member_ids = grid.getSelections().map((selected) => {
                                            return selected.get('member_id');
                                        });
                                        if (member_ids.length == 0) {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                message: (await Admin.getText('admin.actions.unselected_members')),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                            });
                                            return;
                                        }
                                        const loading = new Aui.Loading(window, {
                                            type: 'dot',
                                            direction: 'column',
                                            text: Aui.printText('actions.saving'),
                                        }).show();
                                        const results = await Ajax.post(this.getProcessUrl('group.assign'), {
                                            group_id: group_id,
                                            member_ids: member_ids,
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                message: Aui.printText('actions.saved'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const groups = Aui.getComponent('groups');
                                                    await groups.getStore().reload();
                                                    const members = Aui.getComponent('members');
                                                    await members.getStore().reload();
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                        else {
                                            loading.close();
                                        }
                                    },
                                }),
                            ],
                        }).show();
                    },
                    /**
                     * 그룹을 삭제한다.
                     *
                     * @param {string} group_id - 삭제할 그룹고유값
                     */
                    delete: (group_id) => {
                        Aui.Message.delete({
                            message: this.printText('admin.groups.actions.delete'),
                            url: this.getProcessUrl('group'),
                            params: {
                                group_id: group_id,
                            },
                            handler: async () => {
                                const groups = Aui.getComponent('groups');
                                groups.getStore().reload();
                            },
                        });
                    },
                };
                levels = {
                    /**
                     * 레벨을 추가한다.
                     *
                     * @param {number} level_id - 그룹정보를 수정할 경우 수정할 group_id
                     */
                    add: (level_id = null) => {
                        new Aui.Window({
                            title: this.printText('admin.levels.' + (level_id === null ? 'add' : 'edit')),
                            width: 400,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: [
                                        new Aui.Form.Field.Number({
                                            name: 'level_id',
                                            inputAlign: 'left',
                                            allowBlank: false,
                                            emptyText: this.printText('admin.levels.level_id'),
                                            helpText: this.printText('admin.levels.level_id_help'),
                                        }),
                                        new Aui.Form.Field.Text({
                                            name: 'title',
                                            allowBlank: false,
                                            emptyText: this.printText('admin.levels.title'),
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent();
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent();
                                        const form = button.getParent().getItemAt(0);
                                        const results = await form.submit({
                                            url: this.getProcessUrl('level'),
                                            params: { level_id: level_id },
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                message: Aui.printText('actions.saved'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const levels = Aui.getComponent('levels');
                                                    await levels.getStore().reload();
                                                    levels.select({ level_id: results.level_id });
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0);
                                    if (level_id !== null) {
                                        const results = await form.load({
                                            url: this.getProcessUrl('level'),
                                            params: { level_id: level_id },
                                        });
                                        if (results.success == true) {
                                        }
                                        else {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                    /**
                     * 레벨을 삭제한다.
                     *
                     * @param {number} level_id - 삭제할 레벨고유값
                     */
                    delete: (level_id) => {
                        Aui.Message.delete({
                            message: this.printText('admin.levels.actions.delete'),
                            url: this.getProcessUrl('level'),
                            params: {
                                level_id: level_id,
                            },
                            handler: async () => {
                                const levels = Aui.getComponent('levels');
                                levels.getStore().reload();
                            },
                        });
                    },
                };
                members = {
                    /**
                     * 회원을 추가한다.
                     *
                     * @param {number} member_id - 회원정보를 수정할 경우 회원고유값
                     */
                    add: (member_id = null) => {
                        new Aui.Window({
                            title: this.printText('admin.members.' + (member_id === null ? 'add' : 'edit')),
                            width: 500,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    layout: 'fit',
                                    border: false,
                                    items: [
                                        new Aui.Form.Field.Text({
                                            label: this.printText('email'),
                                            name: 'email',
                                            inputType: 'email',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('password'),
                                            name: 'password',
                                            allowBlank: member_id !== null,
                                            helpText: member_id === null
                                                ? null
                                                : this.printText('admin.members.password_edit_help'),
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('name'),
                                            name: 'name',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('nickname'),
                                            name: 'nickname',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Select({
                                            label: this.printText('level'),
                                            name: 'level_id',
                                            store: new Aui.Store.Remote({
                                                url: this.getProcessUrl('levels'),
                                            }),
                                            valueField: 'level_id',
                                            displayField: 'title',
                                            value: 0,
                                        }),
                                        new Aui.Form.Field.Select({
                                            label: this.printText('groups'),
                                            name: 'group_ids',
                                            store: new Aui.TreeStore.Remote({
                                                url: this.getProcessUrl('groups'),
                                                remoteExpand: true,
                                            }),
                                            multiple: true,
                                            valueField: 'group_id',
                                            displayField: 'title',
                                            search: true,
                                            helpText: this.printText('admin.members.groups_help'),
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent();
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent();
                                        const form = button.getParent().getItemAt(0);
                                        const results = await form.submit({
                                            url: this.getProcessUrl('member'),
                                            params: { member_id: member_id },
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                message: Aui.printText('actions.saved'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const groups = Aui.getComponent('groups');
                                                    await groups.getStore().reload();
                                                    const members = Aui.getComponent('members');
                                                    await members.getStore().loadPage(1);
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0);
                                    if (member_id !== null) {
                                        const results = await form.load({
                                            url: this.getProcessUrl('member'),
                                            params: { member_id: member_id },
                                        });
                                        if (results.success == true) {
                                        }
                                        else {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                    /**
                     * 회원을 그룹에서 제외한다.
                     */
                    remove: () => {
                        const types = Aui.getComponent('types');
                        if (types?.getActiveTab()?.getId() !== 'groups') {
                            return;
                        }
                        const groups = Aui.getComponent('groups');
                        const group_id = groups.getSelections().at(0)?.get('group_id') ?? null;
                        if (group_id === null || group_id === 'all') {
                            return;
                        }
                        const members = Aui.getComponent('members');
                        const member_ids = [];
                        for (const record of members.getSelections()) {
                            member_ids.push(record.get('member_id'));
                        }
                        if (member_ids.length == 0) {
                            return;
                        }
                        Aui.Message.delete({
                            url: this.getProcessUrl('member'),
                            params: { member_ids: member_ids.join(','), group_id: group_id },
                            message: this.printText('admin.members.actions.remove'),
                            handler: async (results) => {
                                if (results.success == true) {
                                    await groups.getStore().reload();
                                    members.getStore().reload();
                                }
                            },
                        });
                    },
                    /**
                     * 회원을 비활성화한다.
                     */
                    deactive: () => {
                        //
                    },
                };
                oauth = {
                    clients: {
                        /**
                         * OAuth 클라이언트를 추가한다.
                         *
                         * @param {string} oauth_id
                         */
                        add: (oauth_id = null) => {
                            new Aui.Window({
                                title: oauth_id
                                    ? this.printText('admin.oauth.clients.add')
                                    : this.printText('admin.oauth.clients.edit'),
                                width: 600,
                                modal: true,
                                resizable: false,
                                items: [
                                    new Aui.Form.Panel({
                                        layout: 'fit',
                                        border: false,
                                        items: [
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.oauth.clients.provider'),
                                                items: [
                                                    new Aui.Form.Field.Select({
                                                        label: this.printText('admin.oauth.clients.preset'),
                                                        inputName: null,
                                                        store: new Aui.Store.Remote({
                                                            url: this.getProcessUrl('oauth.presets'),
                                                            primaryKeys: ['oauth_id'],
                                                        }),
                                                        valueField: 'oauth_id',
                                                        displayField: 'oauth_id',
                                                        helpText: this.printText('admin.oauth.clients.preset_help'),
                                                        listeners: {
                                                            change: async (field, value) => {
                                                                const record = await field.getValueToRecord(value);
                                                                if (record === null) {
                                                                    return;
                                                                }
                                                                const form = field.getForm();
                                                                form.getField('auth_url').setValue(record.get('auth_url'));
                                                                form.getField('token_url').setValue(record.get('token_url'));
                                                                form.getField('token_path').setValue(record.get('token_path'));
                                                                form.getField('scope').setValue(record.get('scope').join('\n'));
                                                                form.getField('scope_type').setValue(record.get('scope_type'));
                                                                form.getField('scope_separator').setValue(record.get('scope_separator'));
                                                                form.getField('user_url').setValue(record.get('user_url'));
                                                                form.getField('user_id_path').setValue(record.get('user_id_path'));
                                                                form.getField('user_email_path').setValue(record.get('user_email_path'));
                                                                form.getField('user_name_path').setValue(record.get('user_name_path'));
                                                                form.getField('user_nickname_path').setValue(record.get('user_nickname_path'));
                                                                form.getField('user_photo_path').setValue(record.get('user_photo_path'));
                                                            },
                                                        },
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.auth_url'),
                                                        name: 'auth_url',
                                                        allowBlank: false,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.token_url'),
                                                        name: 'token_url',
                                                        allowBlank: false,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.token_path'),
                                                        name: 'token_path',
                                                        allowBlank: false,
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.oauth.clients.client'),
                                                items: [
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.oauth_id'),
                                                        name: 'oauth_id',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.oauth_id_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.client_id'),
                                                        name: 'client_id',
                                                        allowBlank: false,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.client_secret'),
                                                        name: 'client_secret',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.client_secret_help'),
                                                    }),
                                                    new Aui.Form.Field.TextArea({
                                                        label: this.printText('admin.oauth.clients.scope'),
                                                        name: 'scope',
                                                        helpText: this.printText('admin.oauth.clients.scope_help'),
                                                    }),
                                                    new Aui.Form.Field.Select({
                                                        label: this.printText('admin.oauth.clients.scope_type'),
                                                        name: 'scope_type',
                                                        store: new Aui.Store.Local({
                                                            fields: ['display', 'value'],
                                                            records: (() => {
                                                                const types = ['BASIC', 'USER'];
                                                                const records = [];
                                                                for (const type of types) {
                                                                    records.push([
                                                                        this.printText('admin.oauth.clients.scope_types.' + type),
                                                                        type,
                                                                    ]);
                                                                }
                                                                return records;
                                                            })(),
                                                        }),
                                                        value: 'BASIC',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.scope_type_help'),
                                                    }),
                                                    new Aui.Form.Field.Select({
                                                        label: this.printText('admin.oauth.clients.scope_separator'),
                                                        name: 'scope_separator',
                                                        store: new Aui.Store.Local({
                                                            fields: ['display', 'value'],
                                                            records: (() => {
                                                                const separators = [
                                                                    'COMMA',
                                                                    'SPACE',
                                                                    'COLONS',
                                                                    'SEMICOLONS',
                                                                    'PLUS',
                                                                ];
                                                                const records = [];
                                                                for (const separator of separators) {
                                                                    records.push([
                                                                        this.printText('admin.oauth.clients.scope_separators.' +
                                                                            separator),
                                                                        separator,
                                                                    ]);
                                                                }
                                                                return records;
                                                            })(),
                                                        }),
                                                        value: ',',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.scope_separator_help'),
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.oauth.clients.user'),
                                                items: [
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_url'),
                                                        name: 'user_url',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.user_url_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_id_path'),
                                                        name: 'user_id_path',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.user_id_path_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_email_path'),
                                                        name: 'user_email_path',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.user_email_path_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_name_path'),
                                                        name: 'user_name_path',
                                                        helpText: this.printText('admin.oauth.clients.user_name_path_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_nickname_path'),
                                                        name: 'user_nickname_path',
                                                        allowBlank: false,
                                                        helpText: this.printText('admin.oauth.clients.user_nickname_path_help'),
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: this.printText('admin.oauth.clients.user_photo_path'),
                                                        name: 'user_photo_path',
                                                        helpText: this.printText('admin.oauth.clients.user_photo_path_help'),
                                                    }),
                                                    new Aui.Form.Field.Check({
                                                        label: this.printText('admin.oauth.clients.allow_signup'),
                                                        name: 'allow_signup',
                                                        boxLabel: this.printText('admin.oauth.clients.allow_signup_help'),
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent();
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent();
                                            const form = button.getParent().getItemAt(0);
                                            const results = await form.submit({
                                                url: this.getProcessUrl('oauth.client'),
                                                params: { oauth_id: oauth_id },
                                            });
                                            if (results.success == true) {
                                                Aui.Message.show({
                                                    title: Aui.getErrorText('INFO'),
                                                    message: Aui.printText('actions.saved'),
                                                    icon: Aui.Message.INFO,
                                                    buttons: Aui.Message.OK,
                                                    handler: async () => {
                                                        const clients = Aui.getComponent('clients');
                                                        await clients.getStore().reload();
                                                        window.close();
                                                        Aui.Message.close();
                                                    },
                                                });
                                            }
                                        },
                                    }),
                                ],
                                listeners: {
                                    show: async (window) => {
                                        const form = window.getItemAt(0);
                                        if (oauth_id !== null) {
                                            const results = await form.load({
                                                url: this.getProcessUrl('oauth.client'),
                                                params: { oauth_id: oauth_id },
                                            });
                                            if (results.success == false) {
                                                window.close();
                                            }
                                        }
                                    },
                                },
                            }).show();
                        },
                        /**
                         * 클라이언트를 삭제한다.
                         *
                         * @param {string} oauth_id
                         */
                        delete: (oauth_id) => {
                            //
                        },
                    },
                };
                positions = {
                    /**
                     * 권한을 추가한다.
                     *
                     * @param {string} group_id - 권한을 추가할 그룹 고유값
                     * @param {string} member_id - 권한을 추가할 회원 고유값
                     * @param {string} position - 권한 (MANAGER, MEMBER)
                     */
                    add: async (group_id, member_id, position) => {
                        const results = await Ajax.post(this.getProcessUrl('position'), {}, { group_id: group_id, member_id: member_id, position: position });
                        if (results.success == true) {
                            Aui.Message.show({
                                title: Aui.getErrorText('INFO'),
                                message: Aui.printText('actions.saved'),
                                icon: Aui.Message.INFO,
                                buttons: Aui.Message.OK,
                                handler: () => {
                                    const members = Aui.getComponent('members');
                                    members.getStore().reload();
                                    Aui.Message.close();
                                    window.close();
                                },
                            });
                        }
                    },
                };
            }
            admin.Member = Member;
        })(admin = member.admin || (member.admin = {}));
    })(member = modules.member || (modules.member = {}));
})(modules || (modules = {}));
