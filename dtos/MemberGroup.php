<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원이 속한 그룹구조체를 정의한다.
 *
 * @file /modules/member/dtos/MemberGroup.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2025. 1. 9.
 */
namespace modules\member\dtos;
class MemberGroup
{
    /**
     * @var string $_member_id 회원고유값
     */
    private string $_member_id;

    /**
     * @var string $_group_id 그룹고유값
     */
    private string $_group_id;

    /**
     * @var int $_assigned_at 그룹할당일시
     */
    private int $_assigned_at;

    /**
     * @var string $position 그룹 내 권한
     */
    private string $_position;

    /**
     * @var \modules\member\dtos\Group $_group 그룹정보
     */
    private \modules\member\dtos\Group $_group;

    /**
     * 그룹 구조체를 정의한다.
     *
     * @param $joined 그룹할당정보
     */
    public function __construct(object $assigned)
    {
        $this->_member_id = $assigned->member_id;
        $this->_group_id = $assigned->group_id;
        $this->_assigned_at = $assigned->assigned_at;
        $this->_position = $assigned->position;
    }

    /**
     * 회원고유값을 가져온다.
     *
     * @return int $member_id
     */
    public function getMemberId(): int
    {
        return $this->_member_id;
    }

    /**
     * 그룹고유값을 가져온다.
     *
     * @return string $group_id
     */
    public function getGroupId(): string
    {
        return $this->_group_id;
    }

    /**
     * 그룹 내 권한을 가져온다.
     *
     * @return string $position
     */
    public function getPosition(): string
    {
        return $this->_position;
    }

    /**
     * 그룹에 할당된 시각
     *
     * @return int $assigned_at
     */
    public function getAssignedAt(): int
    {
        return $this->_assigned_at;
    }

    /**
     * 그룹정보를 가져온다.
     *
     * @return \modules\member\dtos\Group $group
     */
    public function getGroup(): \modules\member\dtos\Group
    {
        if (isset($this->_group) == false) {
            /**
             * @var \modules\member\Member $mMember
             */
            $mMember = \Modules::get('member');
            $this->_group = $mMember->getGroup($this->_group_id);
        }

        return $this->_group;
    }
}
