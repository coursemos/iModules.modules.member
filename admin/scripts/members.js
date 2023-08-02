/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원관리화면을 구성한다.
 *
 * @file /modules/member/admin/scripts/members.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
Admin.ready(async () => {
    const me = Admin.getModule('member');
    return new Admin.Grid.Panel({
        id: 'members',
        iconClass: 'xi xi-box',
        border: false,
        layout: 'fit',
        title: (await me.getText('admin.members.title')),
        selection: { selectable: true, display: 'check' },
        autoLoad: true,
        topbar: [
            new Admin.Form.Field.Text({
                name: 'keyword',
                width: 200,
                emptyText: (await me.getText('keyword')),
            }),
            '->',
            new Admin.Button({
                iconClass: 'mi mi-refresh',
                text: (await me.getText('admin.modules.modules.update_size')),
            }),
        ],
        bottombar: new Admin.Grid.Pagination([
            new Admin.Button({
                iconClass: 'mi mi-refresh',
                handler: (button) => {
                    const grid = button.getParent().getParent();
                    grid.getStore().reload();
                },
            }),
        ]),
        columns: [
            {
                text: (await me.getText('admin.members.member_id')),
                dataIndex: 'member_id',
                width: 40,
            },
            {
                text: (await me.getText('admin.members.email')),
                dataIndex: 'email',
                sortable: true,
                width: 200,
            },
            {
                text: (await me.getText('admin.members.name')),
                dataIndex: 'name',
                width: 150,
                sortable: true,
                renderer: (value, record) => {
                    return '<i class="photo" style="background-image:url(' + record.data.photo + ')"></i>' + value;
                },
            },
            {
                text: (await me.getText('admin.members.nickname')),
                dataIndex: 'nickname',
                sortable: true,
                width: 150,
            },
            {
                text: (await me.getText('admin.members.joined_at')),
                dataIndex: 'joined_at',
                width: 160,
                sortable: true,
                renderer: Admin.Grid.Renderer.DateTime(),
            },
            {
                text: (await me.getText('admin.members.logged_at')),
                dataIndex: 'logged_at',
                width: 160,
                sortable: true,
                renderer: Admin.Grid.Renderer.DateTime(),
            },
        ],
        store: new Admin.Store.Ajax({
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
        listeners: {
            openItem: (record) => {
                //
            },
            openMenu: (menu, record) => {
                //
            },
        },
    });
});
