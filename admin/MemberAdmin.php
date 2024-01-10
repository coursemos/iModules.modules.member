<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/member/admin/MemberAdmin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
namespace modules\member\admin;
class MemberAdmin extends \modules\admin\admin\Admin
{
    /**
     * 관리자 컨텍스트를 초기화한다.
     */
    public function init(): void
    {
        /**
         * 관리자 메뉴를 추가한다.
         */
        if ($this->checkPermission('members') == true) {
            $this->addContext('/members', $this->getText('admin.contexts.members'), 'xi xi-users', true);
        }
    }

    /**
     * 전체 회원그룹을 가져온다.
     *
     * @return array $groups
     */
    public function getGroups(): array
    {
        $groups = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('parent', null)
            ->get();

        $tree = $this->db()
            ->select(['depth', 'count(*) as count'])
            ->from($this->table('groups'))
            ->groupBy('depth')
            ->orderBy('depth', 'asc')
            ->get();
        $limit = 0;
        foreach ($tree as $depth) {
            if ($depth->count > 100) {
                $limit = $depth->depth;
                break;
            }
        }

        $sort = 0;
        foreach ($groups as &$group) {
            $group->sort = $sort++;
            $group->children = $this->getGroupChildren($group->group_id, $limit);
        }

        return $groups;
    }

    /**
     * 전체 회원그룹을 가져온다.
     *
     * @return array $groups
     */
    public function getGroupsWithFilter(string $keyword, ?string $parent_id = null): array|bool
    {
        $groups = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('parent', $parent_id)
            ->get();

        $children = [];
        $sort = 0;
        foreach ($groups as &$group) {
            $group->sort = $sort++;
            $group->children = $this->getGroupsWithFilter($keyword, $group->group_id);

            if (
                strpos(\Format::keycode($group->title), \Format::keycode($keyword)) !== false ||
                $group->children !== false
            ) {
                $children[] = $group;
            }
        }

        return count($children) == 0 ? false : $children;
    }

    /**
     * 특정 그룹의 자식그룹목록을 재귀적으로 가져온다.
     *
     * @param string $parent_id 부모그룹아이디
     * @param int $limit 단계제한 (0인 경우 무제한)
     * @return array $children
     */
    function getGroupChildren(string $parent_id, int $limit = 0): array|bool
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = $this->getComponent();
        $parent = $mMember->getGroup($parent_id);
        $children = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('parent', $parent_id)
            ->get();

        if ($limit > 0 && $parent->getDepth() >= $limit) {
            return count($children) > 0 ? true : false;
        }

        $sort = 0;
        foreach ($children as &$child) {
            $child->sort = $sort++;
            $child->children = $this->getGroupChildren($child->group_id, $limit);
        }

        return count($children) > 0 ? $children : false;
    }

    /**
     * 특정 그룹의 부모그룹을 가져온다.
     *
     * @param string $child_id 자식그룹아이디
     * @return array $parents
     */
    function getGroupParents(string $child_id): array
    {
        $parents = [];
        $child = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('group_id', $child_id)
            ->getOne();

        if ($child == null || $child->parent == null) {
            return $parents;
        }

        $parent_id = $child->parent;
        while (true) {
            $parent = $this->db()
                ->select(['group_id', 'title', 'parent'])
                ->from($this->table('groups'))
                ->where('group_id', $parent_id)
                ->getOne();
            if ($parent == null) {
                return $parents;
            }

            $parent_id = $parent->parent;
            unset($parent->parent);
            array_unshift($parents, $parent);

            if ($parent_id == null) {
                return $parents;
            }
        }
    }

    /**
     * 그룹정보를 갱신한다.
     *
     * @param string $group_id 그룹고유값
     */
    public function updateGroup(string $group_id): void
    {
        $group = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('group_id', $group_id)
            ->getOne();
        if ($group == null) {
            return;
        }

        $parents = $this->getGroupParents($group_id);
        $members = $this->db()
            ->select()
            ->from($this->table('group_members'))
            ->where('group_id', $group_id)
            ->count();
        $this->db()
            ->update($this->table('groups'), ['depth' => count($parents), 'members' => $members])
            ->where('group_id', $group_id)
            ->execute();
    }

    /**
     * 현재 모듈의 관리자 권한종류를 가져온다.
     *
     * @return array $permissions 권한
     */
    public function getPermissions(): array
    {
        return [
            'members' => [
                'label' => $this->getText('admin.permissions.members.title'),
                'permissions' => [
                    'view' => $this->getText('admin.permissions.members.view'),
                    'edit' => $this->getText('admin.permissions.members.edit'),
                    'groups' => $this->getText('admin.permissions.members.groups'),
                ],
            ],
        ];
    }

    /**
     * 각 컨텍스트의 콘텐츠를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @param ?string $subPath 컨텍스트 하위경로
     */
    public function getContent(string $path, ?string $subPath = null): string
    {
        switch ($path) {
            case '/members':
                \Html::script($this->getBase() . '/scripts/members.js');
                break;

                break;
        }

        return '';
    }
}
