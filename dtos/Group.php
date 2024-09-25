<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Group.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 29.
 */
namespace modules\member\dtos;
class Group
{
    /**
     * @var string $_id 회원고유값
     */
    private string $_id;

    /**
     * @var ?string $_parent_id 부모그룹고유값
     */
    private ?string $_parent_id;

    /**
     * @var int $_depth 단계
     */
    private int $_depth = 0;

    /**
     * @var string $_title 그룹명
     */
    private string $_title;

    /**
     * @var int $_members 회원수
     */
    private int $_members = 0;

    /**
     * 그룹 구조체를 정의한다.
     *
     * @param object $group 그룹정보
     */
    public function __construct(object $group)
    {
        $this->_id = $group->group_id;
        $this->_parent_id = $group->parent_id;
        $this->_depth = $group->depth;
        $this->_title = $group->title;
        $this->_members = $group->members;
    }

    /**
     * 고유값을 가져온다.
     *
     * @return string $id
     */
    public function getId(): string
    {
        return $this->_id;
    }

    /**
     * 그룹단계를 가져온다.
     *
     * @return int $depth
     */
    public function getDepth(): int
    {
        return $this->_depth;
    }

    /**
     * 상위그룹 아이디를 가져온다.
     *
     * @return ?string $parent_id
     */
    public function getParentId(): ?string
    {
        return $this->_parent_id;
    }

    /**
     * 그룹명을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * 상위그룹 전체를 가져온다.
     *
     * @return \modules\member\dtos\Group[] $parents
     */
    public function getParents(): array
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        if ($this->_parent_id !== null) {
            $parent = $mMember->getGroup($this->_parent_id);
            $parents = [$parent, ...$mMember->getGroup($this->_parent_id)?->getParents() ?? []];
        } else {
            $parents = [];
        }

        return $parents;
    }

    /**
     * 상위그룹 고유값 전체를 가져온다.
     *
     * @return string[] $parent_ids
     */
    public function getParentIds(): array
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        if ($this->_parent_id !== null) {
            $parent = $mMember->getGroup($this->_parent_id);
            $parents = [$parent->getId(), ...$mMember->getGroup($this->_parent_id)?->getParentIds() ?? []];
        } else {
            $parents = [];
        }

        return $parents;
    }

    /**
     * 하위그룹 고유값 전체를 가져온다.
     *
     * @return string[] $child_ids
     */
    public function getChildIds(): array
    {
        return [];
    }

    /**
     * 회원을 그룹에 추가한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 회원)
     * @return bool $success
     */
    public function assignMember(?int $member_id = null): bool
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member_id ??= $mMember->getLogged();
        if ($member_id === 0) {
            return false;
        }

        $time = time();
        $group_ids = [$this->_id];
        $group_ids = array_merge($group_ids, $this->getParentIds());
        foreach ($group_ids as $group_id) {
            $group = $mMember
                ->db()
                ->select()
                ->from($mMember->table('groups'))
                ->where('group_id', $group_id)
                ->getOne();
            if ($group === null) {
                return false;
            }

            $assigned = $mMember
                ->db()
                ->select()
                ->from($mMember->table('group_members'))
                ->where('group_id', $group_id)
                ->where('member_id', $member_id)
                ->getOne();
            if ($assigned === null) {
                $mMember
                    ->db()
                    ->insert($mMember->table('group_members'), [
                        'group_id' => $group_id,
                        'member_id' => $member_id,
                        'assigned_at' => $time,
                    ])
                    ->execute();
                $mMember->getGroup($group_id)->update();
            } else {
                $time = $assigned->assigned_at;
            }
        }

        return true;
    }

    /**
     * 그룹에서 그룹구성원을 제외한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 회원)
     * @return bool $success
     */
    public function removeMember(?int $member_id = null): bool
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member_id ??= $mMember->getLogged();
        if ($member_id === 0) {
            return false;
        }

        $assigned = $mMember
            ->db()
            ->select()
            ->from($mMember->table('group_members'))
            ->where('group_id', $this->_id)
            ->where('member_id', $member_id)
            ->getOne();
        if ($assigned === null) {
            return false;
        }

        $mMember
            ->db()
            ->delete($mMember->table('group_members'))
            ->where('group_id', $this->_id)
            ->where('member_id', $member_id)
            ->execute();
        $this->update();

        $children = $mMember
            ->db()
            ->select(['group_id'])
            ->from($mMember->table('groups'))
            ->where('parent_id', $this->_id)
            ->get('group_id');
        foreach ($children as $child_id) {
            $mMember->getGroup($child_id)->removeMember($member_id);
        }
    }

    /**
     * 그룹정보를 갱신한다.
     *
     * @param string $group_id 그룹고유값
     */
    public function update(): void
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $this->_depth = count($this->getParents());
        $this->_members = $mMember
            ->db()
            ->select()
            ->from($mMember->table('group_members'))
            ->where('group_id', $this->_id)
            ->count();

        $mMember
            ->db()
            ->update($mMember->table('groups'), ['depth' => $this->_depth, 'members' => $this->_members])
            ->where('group_id', $this->_id)
            ->execute();
    }

    /**
     * 그룹정보를 JSON 으로 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $group = new \stdClass();
        $group->group_id = $this->_id;
        $group->title = $this->_title;

        return $group;
    }
}
