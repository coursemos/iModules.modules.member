/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/member/admin/scripts/Member.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
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
                                        new Aui.Form.Field.Select({
                                            name: 'parent_id',
                                            store: new Aui.TreeStore.Ajax({
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
                                            emptyText: this.printText('admin.groups.parent'),
                                            value: parent,
                                        }),
                                        new Aui.Form.Field.Text({
                                            name: 'title',
                                            emptyText: this.printText('admin.groups.title'),
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
                                                title: (await Admin.getText('info')),
                                                message: (await Admin.getText('actions.saved')),
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
                    addMembers: (group_id, title = null) => {
                        new Aui.Window({
                            title: this.printText('admin.groups.add_member') + (title ? ' (' + title + ')' : ''),
                            width: 800,
                            height: 600,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Grid.Panel({
                                    border: [false, true, false, false],
                                    layout: 'fit',
                                    width: 400,
                                    selection: { selectable: true, display: 'check', keepable: true },
                                    autoLoad: true,
                                    freeze: 1,
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
                                            value: this.printText('text.selected_members', { count: '0' }),
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
                                            text: this.printText('admin.members.email'),
                                            dataIndex: 'email',
                                            minWidth: 200,
                                        },
                                        {
                                            text: this.printText('admin.members.name'),
                                            dataIndex: 'name',
                                            width: 150,
                                            renderer: (value, record) => {
                                                return ('<i class="photo" style="background-image:url(' +
                                                    record.data.photo +
                                                    ')"></i>' +
                                                    value);
                                            },
                                        },
                                        {
                                            text: this.printText('admin.members.nickname'),
                                            dataIndex: 'nickname',
                                            width: 150,
                                        },
                                        {
                                            text: this.printText('admin.members.joined_at'),
                                            dataIndex: 'joined_at',
                                            width: 160,
                                            sortable: true,
                                            renderer: Aui.Grid.Renderer.DateTime(),
                                        },
                                    ],
                                    store: new Aui.Store.Ajax({
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
                                            display.setValue(this.printText('text.selected_members', {
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
                                                title: (await Admin.getText('info')),
                                                message: (await Admin.getText('admin.actions.unselected_members')),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                            });
                                            return;
                                        }
                                        const results = await Aui.Ajax.post(this.getProcessUrl('group.members'), {
                                            group_id: group_id,
                                            member_ids: member_ids,
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: (await Admin.getText('info')),
                                                message: (await Admin.getText('actions.saved')),
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
                                    },
                                }),
                            ],
                        }).show();
                    },
                    /**
                     * 그룹을 삭제한다.
                     *
                     * @param {string} group_id
                     */
                    delete: (group_id) => {
                        //
                    },
                };
                members = {
                    /**
                     * 회원을 추가한다.
                     */
                    add: () => {
                        new Aui.Window({
                            title: this.printText('admin.members.add'),
                            width: 500,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    layout: 'fit',
                                    border: false,
                                    items: [
                                        new Aui.Form.Field.Text({
                                            label: this.printText('admin.members.email'),
                                            name: 'email',
                                            inputType: 'email',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('admin.members.password'),
                                            name: 'password',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('admin.members.name'),
                                            name: 'name',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Text({
                                            label: this.printText('admin.members.nickname'),
                                            name: 'nickname',
                                            allowBlank: false,
                                        }),
                                        new Aui.Form.Field.Select({
                                            label: this.printText('admin.members.groups'),
                                            name: 'group_ids',
                                            store: new Aui.TreeStore.Ajax({
                                                url: this.getProcessUrl('groups'),
                                            }),
                                            multiple: true,
                                            valueField: 'group_id',
                                            displayField: 'title',
                                            search: true,
                                            emptyText: this.printText('admin.members.nogroups'),
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
                                        });
                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: (await Admin.getText('info')),
                                                message: (await Admin.getText('actions.saved')),
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
                        }).show();
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
                                                        store: new Aui.Store.Ajax({
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
                                                                form.getField('scope').setValue(record.get('scope').join('\n'));
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
                                                        label: this.printText('admin.oauth.clients.scope_separator'),
                                                        name: 'scope_separator',
                                                        store: new Aui.Store.Array({
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
                                                    title: (await Admin.getText('info')),
                                                    message: (await Admin.getText('actions.saved')),
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
            }
            admin.Member = Member;
        })(admin = member.admin || (member.admin = {}));
    })(member = modules.member || (modules.member = {}));
})(modules || (modules = {}));
